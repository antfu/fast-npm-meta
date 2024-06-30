import { joinURL } from 'ufo'
import { createCache } from 'async-cache-dedupe'
import { $fetch } from 'ofetch'
import type { Packument } from './types'

const ABBREVIATED_DOC = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
const REGISTRY = 'https://registry.npmjs.org/'

const cache = createCache({
  ttl: 60, // seconds
  stale: 5, // number of seconds to return data after ttl has expired
  storage: {
    type: 'memory', // TODO: Reddis
  },
})
  .define('fetchPackageManifest', async (name: string) => {
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
      lastUpdated: Date.now(),
    }
  })

export async function fetchPackageManifest(name: string) {
  const packument = await cache.fetchPackageManifest(name)
  return packument
}
