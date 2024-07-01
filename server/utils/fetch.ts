/* eslint-disable no-console */
import { joinURL } from 'ufo'
import { $fetch } from 'ofetch'
import type { PackageManifestError } from './types'

const ABBREVIATED_DOC = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
const REGISTRY = 'https://registry.npmjs.org/'

const promiseCache = new Map<string, ReturnType<typeof _fetchPackageManifest>>()

async function _fetchPackageManifest(name: string): Promise<PackageManifest> {
  console.log('Fetching package:', name)

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

  const storage = useStorage<PackageManifest | PackageManifestError>('manifest')
  const storedData = await storage.getItem(name)

  if (storedData) {
    const timeout = force ? CACHE_TIMEOUT_FORCE : CACHE_TIMEOUT
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

  const promise = _fetchPackageManifest(name)
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
   * In the full packument, an object mapping version numbers to publication
   * times, for the `opts.before` functionality.
   */
  'time': Record<string, string> & {
    created: string
    modified: string
  }
}
