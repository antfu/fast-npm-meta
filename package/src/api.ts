import type { PackageManifest, ResolvedPackageVersion } from '../../shared/types'

export interface ApiOptions {
  force?: boolean
  apiEndpoint?: string
  /**
   * Fetch function
   */
  fetch?: typeof fetch
}

export const defaultOptions = {
  /**
   * API endpoint for fetching package versions
   *
   * @default 'https://npm.antfu.dev/'
   */
  apiEndpoint: 'https://npm.antfu.dev/',

} satisfies ApiOptions

export async function getLatestVersionBatch(
  packages: string[],
  options: ApiOptions = {},
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
  options: ApiOptions = {},
): Promise<ResolvedPackageVersion> {
  const [data] = await getLatestVersionBatch([name], options)
  return data
}

export async function getVersionsBatch(
  packages: string[],
  options: ApiOptions = {},
): Promise<PackageManifest[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
    fetch: fetchApi = fetch,
  } = options

  const query = options.force ? '?force=true' : ''
  const data = await fetchApi(new URL(`/versions/${packages.join('+')}${query}`, apiEndpoint))
    .then(r => r.json()) as PackageManifest | PackageManifest[]

  if (!Array.isArray(data))
    return [data]
  return data
}

export async function getVersions(
  name: string,
  options: ApiOptions = {},
): Promise<PackageManifest> {
  const [data] = await getVersionsBatch([name], options)
  return data
}
