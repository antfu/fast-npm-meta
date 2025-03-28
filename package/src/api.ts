import type { MaybeError, PackageVersionsInfo, PackageVersionsInfoWithMetadata, ResolvedPackageVersion } from '../../shared/types'

export interface FetchOptions {
  apiEndpoint?: string
  /**
   * Fetch function
   */
  fetch?: typeof fetch
  /**
   * Should throw error or return error object
   *
   * @default false
   */
  throw?: boolean
}

export interface GetVersionsOptions<WithMetadata extends boolean> extends FetchOptions {
  /**
   * By pass cache and get the latest data
   */
  force?: boolean
  /**
   * Include all versions that are newer than the specified version
   */
  loose?: boolean
  /**
   * Includes metadata, this will change the return type
   */
  metadata?: WithMetadata
}

export interface GetLatestVersionOptions extends FetchOptions {
  /**
   * By pass cache and get the latest data
   */
  force?: boolean
  /**
   * Includes metadata
   */
  metadata?: boolean
}

export const defaultOptions = {
  /**
   * API endpoint for fetching package versions
   *
   * @default 'https://npm.antfu.dev/'
   */
  apiEndpoint: 'https://npm.antfu.dev/',
} satisfies FetchOptions

export async function getLatestVersionBatch(
  packages: string[],
  options: GetLatestVersionOptions = {},
): Promise<MaybeError<ResolvedPackageVersion>[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
    throw: throwError = false,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.metadata ? 'metadata=true' : '',
    throwError ? '' : 'throw=false',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const data = await fetchApi(new URL(packages.join('+') + query, apiEndpoint))
    .then(r => r.json()) as MaybeError<ResolvedPackageVersion> | MaybeError<ResolvedPackageVersion>[]

  const list = toArray(data)
  return throwError
    ? throwErrorObject(list)
    : list
}

export async function getLatestVersion(
  name: string,
  options: GetLatestVersionOptions = {},
): Promise<MaybeError<ResolvedPackageVersion>> {
  const [data] = await getLatestVersionBatch([name], options)
  return data
}

export async function getVersionsBatch(
  packages: string[],
  options?: GetVersionsOptions<false>,
): Promise<MaybeError<PackageVersionsInfo>[]>
export async function getVersionsBatch(
  packages: string[],
  options: GetVersionsOptions<true>,
): Promise<MaybeError<PackageVersionsInfoWithMetadata>[]>
export async function getVersionsBatch(
  packages: string[],
  options: GetVersionsOptions<boolean> = {},
): Promise<MaybeError<PackageVersionsInfo>[] | MaybeError<PackageVersionsInfoWithMetadata>[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
    throw: throwError = false,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.loose ? 'loose=true' : '',
    options.metadata ? 'metadata=true' : '',
    throwError ? '' : 'throw=false',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const data = await fetchApi(new URL(`/versions/${packages.join('+')}${query}`, apiEndpoint))
    .then(r => r.json()) as MaybeError<PackageVersionsInfo> | MaybeError<PackageVersionsInfo>[]

  const list = toArray(data)
  return throwError
    ? throwErrorObject(list)
    : list
}

export async function getVersions(
  name: string,
  options?: GetVersionsOptions<false>,
): Promise<MaybeError<PackageVersionsInfo>>
export async function getVersions(
  name: string,
  options: GetVersionsOptions<true>,
): Promise<MaybeError<PackageVersionsInfoWithMetadata>>
export async function getVersions(
  name: string,
  options: GetVersionsOptions<boolean> = {},
): Promise<MaybeError<PackageVersionsInfo> | MaybeError<PackageVersionsInfoWithMetadata>> {
  const [data] = await getVersionsBatch([name], options as GetVersionsOptions<true>)
  return data
}

function throwErrorObject<T extends object>(data: MaybeError<T>): T {
  if (data && 'error' in data)
    throw new Error(data.error)
  return data
}

function toArray<T>(data: T | T[]): T[] {
  if (Array.isArray(data))
    return data
  return [data]
}
