import { fetchPackageManifest as _fetchPackageManifest } from '../../package/src/helpers'
import type { PackageManifest, PackageManifestError } from '../../shared/types'

const REGISTRY = 'https://registry.npmjs.org/'
const USER_AGENT = `get-npm-meta`
const STORAGE_KEY = 'manifest-v2'

const promiseCache = new Map<string, Promise<PackageManifest>>()

const FullManifest = true

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
  const promise = _fetchPackageManifest(name, {
    registry: registryUrl,
    fullManifest: FullManifest,
    userAgent: registryUserAgent,
  })
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
