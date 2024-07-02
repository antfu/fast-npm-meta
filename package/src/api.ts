import type { PackageVersionsInfo, ResolvedPackageVersion } from '../../shared/types'

export interface FetchOptions {
  apiEndpoint?: string
  /**
   * Fetch function
   */
  fetch?: typeof fetch
}

export interface GetVersionsOptions extends FetchOptions {
  /**
   * By pass cache and get the latest data
   */
  force?: boolean
  /**
   * Include all versions that are newer than the specified version
   */
  loose?: boolean
}

export interface GetLatestVersionOptions extends FetchOptions {
  /**
   * By pass cache and get the latest data
   */
  force?: boolean
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

  const query = options.force ? '?force=true' : ''
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
  options: GetVersionsOptions = {},
): Promise<PackageVersionsInfo[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
  } = options

  let query = [
    options.force ? 'force=true' : '',
    options.loose ? 'loose=true' : '',
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
  options: GetVersionsOptions = {},
): Promise<PackageVersionsInfo> {
  const [data] = await getVersionsBatch([name], options)
  return data
}
