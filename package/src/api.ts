import type { MaybeError, PackageVersionsInfo, PackageVersionsInfoWithMetadata, ResolvedPackageVersion, ResolvedPackageVersionWithMetadata } from '../../shared/types'

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
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.metadata ? 'metadata=true' : '',
    throwError ? '' : 'throw=false',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const data = await fetchApi(new URL(packages.join('+') + query, apiEndpoint))
    .then(r => r.json()) as InferGetLatestVersionResult<Metadata, Throw> | InferGetLatestVersionResult<Metadata, Throw>[]

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

  const data = await fetchApi(new URL(`/versions/${packages.join('+')}${query}`, apiEndpoint))
    .then(r => r.json()) as InferGetVersionsResult<Metadata, Throw> | InferGetVersionsResult<Metadata, Throw>[]

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
