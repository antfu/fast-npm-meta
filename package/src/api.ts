import { $fetch } from 'ofetch'
import type { PackageManifest, ResolvedPackageVersion } from '../../shared/types'

export interface ApiOptions {
  force?: boolean
  apiEndpoint?: string
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
  } = options

  const data = await $fetch<ResolvedPackageVersion | ResolvedPackageVersion[]>(
    packages.join('+'),
    {
      baseURL: apiEndpoint,
      query: {
        force: options.force ? true : undefined,
      },
    },
  )
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
  } = options

  const data = await $fetch<PackageManifest | PackageManifest[]>(
    `/versions/${packages.join('+')}`,
    {
      baseURL: apiEndpoint,
      query: {
        force: options.force ? true : undefined,
      },
    },
  )
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
