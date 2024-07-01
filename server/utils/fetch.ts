import { joinURL } from 'ufo'
import { $fetch } from 'ofetch'
import type { Packument } from './types'

const ABBREVIATED_DOC = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
const REGISTRY = 'https://registry.npmjs.org/'

const promiseCache = new Map<string, ReturnType<typeof _fetchPackageManifest>>()

export interface PackageManifest {
  name: string
  distTags: Record<string, string> & {
    latest: string
  }
  versions: string[]
  lastSynced: number
}

async function _fetchPackageManifest(name: string): Promise<PackageManifest> {
  const url = joinURL(REGISTRY, name)

  const packument = await $fetch(url, {
    headers: {
      'user-agent': `get-npm-meta`,
      'accept': ABBREVIATED_DOC,
    },
  }) as unknown as Packument

  return {
    name: packument.name,
    distTags: packument['dist-tags'],
    versions: Object.keys(packument.versions),
    lastSynced: Date.now(),
  }
}

const CACHE_TIMEOUT = /* 30min */ 1000 * 60 * 15
const CACHE_TIMEOUT_FORCE = /* 30sec */ 1000 * 30

export async function fetchPackageManifest(name: string, force = false) {
  // Short-term cache, another request in progress
  if (promiseCache.has(name)) {
    return promiseCache.get(name)
  }

  const storage = useStorage<PackageManifest>('manifest')
  const storedData = await storage.getItem(name)

  if (storedData) {
    const timeout = force ? CACHE_TIMEOUT_FORCE : CACHE_TIMEOUT
    // Long-term cache in unstorage
    if (storedData.lastSynced + timeout > Date.now()) {
      return storedData
    }
    // Expired, remove from storage
    else {
      await storage.removeItem(name)
    }
  }

  const promise = _fetchPackageManifest(name)
    .then(async (res) => {
      await storage.setItem(name, res)
      return res
    })
    .finally(() => {
      promiseCache.delete(name)
    })

  promiseCache.set(name, promise)
  return promise
}
