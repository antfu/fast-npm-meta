import type { MaybeError, PackageVersionsInfo, PackageVersionsInfoWithMetadata, ResolvedPackageVersion, ResolvedPackageVersionWithMetadata } from '../../shared/types'
import pRetry from 'p-retry'

// explicitly only expose a subset of p-retry's types, in case we might want to swap the implementation
export interface RetryOptions {
  /**
   * The number of times to retry the operation.
   *
   * @default 5
   */
  retries?: number
  /**
   * The exponential factor to use.
   *
   * @default 2
   */
  factor?: number
  /**
   * The number of milliseconds before starting the first retry.
   *
   * Set this to `0` to retry immediately with no delay.
   *
   * @default 1000
   */
  minTimeout?: number
  /**
   * The maximum number of milliseconds between two retries.
   *
   * @default Infinity
   */
  maxTimeout?: number
  /**
   * Randomizes the timeouts by multiplying with a factor between 1 and 2.
   *
   * @default false
   */
  randomize?: boolean
}

const defaultRetryOptions: RetryOptions = {
  retries: 5,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: Infinity,
  randomize: false,
}

export interface FetchOptions<Throw extends boolean = true> {
  /**
   * API endpoint for fetching package versions
   *
   * @default 'https://npm.antfu.dev/'
   */
  apiEndpoint?: string
  /**
   * Fetch function
   *
   * @default [globalThis.fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
   */
  fetch?: typeof fetch
  /**
   * Should throw error or return error object
   *
   * @default true
   */
  throw?: Throw
}

export interface GetVersionsOptions<
  Metadata extends boolean = false,
  Throw extends boolean = true,
> extends FetchOptions<Throw> {
  /**
   * By pass cache and get the latest data
   *
   * @default false
   */
  force?: boolean
  /**
   * Include all versions that are newer than the specified version
   *
   * @default false
   */
  loose?: boolean
  /**
   * Includes metadata, this will change the return type
   *
   * @default false
   */
  metadata?: Metadata
  /**
   * Only return versions published after this ISO date-time
   *
   * @default undefined
   */
  after?: string
  /**
   * Retry options for the built-in retry mechanism
   *
   * Can be:
   * - `RetryOptions` object for fine-grained control
   * - `number` for simple retry count (uses defaults for other options)
   * - `false` to disable retries
   */
  retry?: RetryOptions | number | false
}

export interface GetLatestVersionOptions<
  Metadata extends boolean = false,
  Throw extends boolean = true,
> extends FetchOptions<Throw> {
  /**
   * By pass cache and get the latest data
   *
   * @default false
   */
  force?: boolean
  /**
   * Includes metadata
   *
   * @default false
   */
  metadata?: Metadata
  /**
   * Retry options for the built-in retry mechanism
   *
   * Can be:
   * - `RetryOptions` object for fine-grained control
   * - `number` for simple retry count (uses defaults for other options)
   * - `false` to disable retries
   */
  retry?: RetryOptions | number | false
}

export type InferGetVersionsResult<Metadata, Throw> = Metadata extends true
  ? Throw extends true ? PackageVersionsInfoWithMetadata
    : MaybeError<PackageVersionsInfoWithMetadata>
  : Throw extends true ? PackageVersionsInfo
    : MaybeError<PackageVersionsInfo>

export type InferGetLatestVersionResult<Metadata, Throw> = Metadata extends true
  ? Throw extends true ? ResolvedPackageVersionWithMetadata
    : MaybeError<ResolvedPackageVersionWithMetadata>
  : Throw extends true ? ResolvedPackageVersion
    : MaybeError<ResolvedPackageVersion>

export const defaultOptions = {
  /**
   * API endpoint for fetching package versions
   *
   * @default 'https://npm.antfu.dev/'
   */
  apiEndpoint: 'https://npm.antfu.dev/',
} satisfies FetchOptions

export async function getLatestVersionBatch<
  Metadata extends boolean = false,
  Throw extends boolean = true,
>(
  packages: string[],
  options: GetLatestVersionOptions<Metadata, Throw> = {},
): Promise<InferGetLatestVersionResult<Metadata, Throw>[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
    throw: throwError = true,
    retry = defaultRetryOptions,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.metadata ? 'metadata=true' : '',
    throwError ? '' : 'throw=false',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const fetchFn = () => fetchApi(new URL(packages.join('+') + query, apiEndpoint))
    .then(r => r.json())

  const retryOptions = typeof retry === 'number' ? { ...defaultRetryOptions, retries: retry } : retry
  const data = await (retry === false
    ? fetchFn()
    : pRetry(fetchFn, retryOptions)) as InferGetLatestVersionResult<Metadata, Throw> | InferGetLatestVersionResult<Metadata, Throw>[]

  const list = toArray(data)
  return throwError
    ? throwErrorObject(list)
    : list
}

export async function getLatestVersion<
  Metadata extends boolean = false,
  Throw extends boolean = true,
>(
  name: string,
  options: GetLatestVersionOptions<Metadata, Throw> = {},
): Promise<InferGetLatestVersionResult<Metadata, Throw>> {
  const [data] = await getLatestVersionBatch<Metadata, Throw>([name], options)
  return data
}

export async function getVersionsBatch<
  Metadata extends boolean = false,
  Throw extends boolean = true,
>(
  packages: string[],
  options: GetVersionsOptions<Metadata, Throw> = {},
): Promise<InferGetVersionsResult<Metadata, Throw>[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
    throw: throwError = true,
    retry = defaultRetryOptions,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.loose ? 'loose=true' : '',
    options.metadata ? 'metadata=true' : '',
    options.after ? `after=${encodeURIComponent(options.after)}` : '',
    throwError ? '' : 'throw=false',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const fetchFn = () => fetchApi(new URL(`/versions/${packages.join('+')}${query}`, apiEndpoint))
    .then(r => r.json())

  const data = await (retry === false
    ? fetchFn()
    : pRetry(
        fetchFn,
        typeof retry === 'number' ? { ...defaultRetryOptions, retries: retry } : retry,
      )) as InferGetVersionsResult<Metadata, Throw> | InferGetVersionsResult<Metadata, Throw>[]

  const list = toArray(data)
  return throwError
    ? throwErrorObject(list)
    : list
}

export async function getVersions<
  Metadata extends boolean = false,
  Throw extends boolean = true,
>(
  name: string,
  options: GetVersionsOptions<Metadata, Throw> = {},
): Promise<InferGetVersionsResult<Metadata, Throw>> {
  const [data] = await getVersionsBatch<Metadata, Throw>([name], options)
  return data
}

function throwErrorObject<T extends object>(data: MaybeError<T> | any): T {
  for (const item of toArray(data)) {
    if (item && 'error' in item)
      throw new Error(item.message || item.error)
  }
  return data
}

function toArray<T>(data: T | T[]): T[] {
  if (Array.isArray(data))
    return data
  return [data]
}
