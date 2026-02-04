import type { FetchOptions, GetLatestVersionOptions, GetVersionsOptions, InferGetLatestVersionResult, InferGetVersionsResult, MaybeError, RetryOptions } from './types'
import pRetry from 'p-retry'

const defaultRetryOptions: RetryOptions = {
  retries: 5,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: Infinity,
  randomize: false,
}

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

  const retryOptions: RetryOptions | false = typeof retry === 'number' ? { ...defaultRetryOptions, retries: retry } : retry
  const data = await (retryOptions === false
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
