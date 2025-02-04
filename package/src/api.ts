import type { PackageVersionsInfo, PackageVersionsInfoWithMetadata, ResolvedPackageVersion } from '../../shared/types'

export interface FetchOptions {
  apiEndpoint?: string
  /**
   * Fetch function
   */
  fetch?: typeof fetch
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
): Promise<ResolvedPackageVersion[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.metadata ? 'metadata=true' : '',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const data = await fetchApi(new URL(packages.join('+') + query, apiEndpoint))
    .then(r => r.json()) as ResolvedPackageVersion | ResolvedPackageVersion[]

  if (!Array.isArray(data))
    return [data]
  return data
}

export async function getLatestVersion(
  name: string,
  options: GetLatestVersionOptions = {},
): Promise<ResolvedPackageVersion> {
  const [data] = await getLatestVersionBatch([name], options)
  return data
}

export async function getVersionsBatch(
  packages: string[],
  options?: GetVersionsOptions<false>,
): Promise<PackageVersionsInfo[]>
export async function getVersionsBatch(
  packages: string[],
  options: GetVersionsOptions<true>,
): Promise<PackageVersionsInfoWithMetadata[]>
export async function getVersionsBatch(
  packages: string[],
  options: GetVersionsOptions<boolean> = {},
): Promise<PackageVersionsInfo[] | PackageVersionsInfoWithMetadata[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.loose ? 'loose=true' : '',
    options.metadata ? 'metadata=true' : '',
  ].filter(Boolean).join('&')
  if (query)
    query = `?${query}`

  const data = await fetchApi(new URL(`/versions/${packages.join('+')}${query}`, apiEndpoint))
    .then(r => r.json()) as PackageVersionsInfo | PackageVersionsInfo[]
  if (!Array.isArray(data))
    return [data]
  return data
}

export async function getVersions(
  name: string,
  options?: GetVersionsOptions<false>,
): Promise<PackageVersionsInfo>
export async function getVersions(
  name: string,
  options: GetVersionsOptions<true>,
): Promise<PackageVersionsInfoWithMetadata>
export async function getVersions(
  name: string,
  options: GetVersionsOptions<boolean> = {},
): Promise<PackageVersionsInfo | PackageVersionsInfoWithMetadata> {
  const [data] = await getVersionsBatch([name], options as GetVersionsOptions<true>)
  return data
}
