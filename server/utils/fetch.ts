/* eslint-disable no-console */
import { joinURL } from 'ufo'
import { $fetch } from 'ofetch'
import type { PackageManifest, PackageManifestError, PackageVersionMeta } from '../../shared/types'

const DOC_ABBREVIATED = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
const DOC_FULL = 'application/json'
const REGISTRY = 'https://registry.npmjs.org/'
const USER_AGENT = `get-npm-meta`
const STORAGE_KEY = 'manifest-v2'

const promiseCache = new Map<string, ReturnType<typeof _fetchPackageManifest>>()

const FullManifest = true

async function _fetchPackageManifest(name: string, registry: string, userAgent: string): Promise<PackageManifest> {
  console.log('Fetching package:', name)

  const url = joinURL(registry, name)

  const packument = await $fetch(url, {
    headers: {
      'user-agent': userAgent,
      'accept': FullManifest ? DOC_FULL : DOC_ABBREVIATED,
    },
  }) as unknown as Packument

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

const CACHE_TIMEOUT = /* 15min */ 1000 * 60 * 15
const CACHE_TIMEOUT_FORCE = /* 30sec */ 1000 * 30

export async function fetchPackageManifest(name: string, force = false) {
  // Short-term cache, another request in progress
  if (promiseCache.has(name)) {
    return promiseCache.get(name)
  }

  const config = useRuntimeConfig()
  const storage = useStorage<PackageManifest | PackageManifestError>(STORAGE_KEY)
  const storedData = await storage.getItem(name)

  if (storedData) {
    const cacheTimeoutForce = config.app.cacheTimeoutForce || CACHE_TIMEOUT_FORCE
    const cacheTimeout = config.app.cacheTimeout || CACHE_TIMEOUT
    const timeout = force ? cacheTimeoutForce : cacheTimeout
    // Long-term cache in unstorage
    if (storedData.lastSynced + timeout > Date.now()) {
      if ('error' in storedData)
        throw new Error(storedData.error)
      return storedData
    }
    // Expired, remove from storage
    else {
      await storage.removeItem(name)
    }
  }

  const registryUrl = config.app.registryUrl || REGISTRY
  const registryUserAgent = config.app.registryUserAgent || USER_AGENT
  const promise = _fetchPackageManifest(name, registryUrl, registryUserAgent)
    .then(async (res) => {
      await storage.setItem(name, res)
      return res
    })
    .catch(async (e) => {
      const data: PackageManifestError = {
        error: e.message,
        lastSynced: Date.now(),
      }
      await storage.setItem(name, data)
      throw e.message
    })
    .finally(() => {
      promiseCache.delete(name)
    })

  promiseCache.set(name, promise)
  return promise
}

export interface Packument {
  'name': string
  /**
   * An object where each key is a version, and each value is the engines for
   * that version.
   */
  'engines': Record<string, string>
  /**
   * An object where each key is a version, and each value is the manifest for
   * that version.
   */
  'versions': Record<string, Omit<Packument, 'versions'>>
  /**
   * An object mapping dist-tags to version numbers. This is how `foo@latest`
   * gets turned into `foo@1.2.3`.
   */
  'dist-tags': { latest: string } & Record<string, string>
  /**
   * Deprecated message for the package.
   */
  'deprecated'?: string
  /**
   * In the full packument, an object mapping version numbers to publication
   * times, for the `opts.before` functionality.
   */
  'time': Record<string, string> & {
    created: string
    modified: string
  }
}
