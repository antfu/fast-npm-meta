import type { PackageManifest, PackageVersionMeta, Packument } from '../../shared/types'

export const NPM_REGISTRY = 'https://registry.npmjs.org/'
export const DOC_ABBREVIATED = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
export const DOC_FULL = 'application/json'

/**
 * Lightweight replacement of `npm-registry-fetch` function `pickRegistry`'
 *
 * @param scope - scope of package, get from 'npm-package-arg'
 * @param npmConfigs - npm configs, read from `.npmrc` file
 * @param defaultRegistry - default registry, default to 'https://registry.npmjs.org/'
 */
export function pickRegistry(
  scope: string | null | undefined,
  npmConfigs: Record<string, unknown>,
  defaultRegistry = NPM_REGISTRY,
): string {
  let registry: string | undefined = scope
    ? npmConfigs[`${scope.replace(/^@?/, '@')}:registry`] as string
    : undefined

  if (!registry && typeof npmConfigs.scope === 'string') {
    registry = npmConfigs[`${npmConfigs.scope.replace(/^@?/, '@')}:registry`] as string
  }

  if (!registry) {
    registry = npmConfigs.registry as string || defaultRegistry
  }

  return registry
}

/**
 * Fetch package manifest from npm registry.
 *
 * @param name - package name
 * @param options - fetch options
 * @param options.registry - npm registry URL, defaults to 'https://registry.npmjs.org/'
 * @param options.fullManifest - whether to fetch full manifest instead of abbreviated version, defaults to false
 * @param options.userAgent - custom user agent for the request
 */
export async function fetchPackageManifest(
  name: string,
  options?: {
    registry?: string
    fullManifest?: boolean
    userAgent?: string
  },
): Promise<PackageManifest> {
  const registry = options?.registry || NPM_REGISTRY
  const url = registry.endsWith('/') ? `${registry}${name}` : `${registry}/${name}`

  const headers = new Headers()
  headers.set('accept', options?.fullManifest ? DOC_FULL : DOC_ABBREVIATED)
  if (options?.userAgent) {
    headers.set('user-agent', options.userAgent)
  }

  const resp = await fetch(url, { headers })
  if (!resp.ok) {
    throw new Error(`[GET] "${url}": ${resp.status} ${resp.statusText}`)
  }

  const packument = await resp.json() as Packument

  function createPackageVersionMeta(version: string, data: Omit<Packument, 'versions'>): PackageVersionMeta {
    const meta: PackageVersionMeta = {
      time: packument.time[version],
    }
    if (data.engines)
      meta.engines = data.engines
    if (data.deprecated)
      meta.deprecated = data.deprecated
    return meta
  }

  return {
    name: packument.name,
    distTags: packument['dist-tags'],
    versionsMeta: Object.fromEntries(
      Object.entries(packument.versions).map(([version, data]) => {
        return [version, createPackageVersionMeta(version, data)] satisfies [string, PackageVersionMeta]
      }),
    ),
    timeCreated: packument.time.created,
    timeModified: packument.time.modified,
    lastSynced: Date.now(),
  }
}
