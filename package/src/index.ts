import { $fetch } from 'ofetch'
import type { ResolvedPackageVersion } from '../../server/utils/types'

export interface ApiOptions {
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

export async function getLatestVersions(
  packages: string[],
  options: ApiOptions = {},
): Promise<ResolvedPackageVersion[]> {
  const {
    apiEndpoint = defaultOptions.apiEndpoint,
  } = options

  const data = await $fetch<ResolvedPackageVersion | ResolvedPackageVersion[]>(apiEndpoint + packages.join('+'))
  if (!Array.isArray(data))
    return [data]
  return data
}

export async function getLatestVersion(
  name: string,
  options: ApiOptions = {},
): Promise<ResolvedPackageVersion> {
  const [data] = await getLatestVersions([name], options)
  return data
}
