import semver from 'semver'
import { fetchPackageManifest } from '../utils/fetch'
import type { ResolvedPackageVersion } from '../../shared/types'
import { handlePackagesQuery } from '../utils/handle'

export default eventHandler(async (event) => {
  const query = getQuery(event)

  return handlePackagesQuery<ResolvedPackageVersion>(
    event,
    async (spec) => {
      const data = await fetchPackageManifest(spec.name, !!query.force)

      let version: string | null = null
      let specifier = 'latest'
      let time: string | null = null

      if (spec.type === 'tag') {
        specifier = spec.fetchSpec
        version = data.distTags[spec.fetchSpec]
      }
      else if (spec.type === 'range' && (spec.fetchSpec === '*' || spec.fetchSpec === 'latest')) {
        version = data.distTags.latest
        specifier = 'latest'
      }
      else if (spec.type === 'range') {
        specifier = spec.fetchSpec
        let maxVersion: string | null = data.distTags.latest
        if (!semver.satisfies(maxVersion, spec.fetchSpec))
          maxVersion = null

        data.versions.forEach((ver) => {
          if (semver.satisfies(ver, spec.fetchSpec)) {
            if (!maxVersion || semver.lte(ver, maxVersion))
              version = ver
          }
        })
      }
      else {
        throw new Error(`Unsupported spec: ${JSON.stringify(spec)}`)
      }

      time = data.time[version] ?? null

      return {
        name: spec.name,
        specifier,
        version,
        publishedAt: time,
        lastSynced: data.lastSynced,
      }
    },
  )
})
