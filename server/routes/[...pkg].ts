import type { ResolvedPackageVersion } from '../../shared/types'
import semver from 'semver'
import { fetchPackageManifest } from '../utils/fetch'
import { handlePackagesQuery } from '../utils/handle'

export default eventHandler(async (event) => {
  return handlePackagesQuery<ResolvedPackageVersion>(
    event,
    async (spec, query) => {
      const data = await fetchPackageManifest(spec.name, !!query.force)

      let version: string | null = null
      let specifier = 'latest'

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

        Object.keys(data.versionsMeta).forEach((ver) => {
          if (semver.satisfies(ver, spec.fetchSpec)) {
            if (!maxVersion || semver.lte(ver, maxVersion))
              version = ver
          }
        })
      }
      else if (spec.type === 'version') {
        version = spec.fetchSpec
        specifier = spec.fetchSpec
      }
      else {
        throw new Error(`Unsupported spec: ${JSON.stringify(spec)}`)
      }

      const meta = data.versionsMeta[version]

      const result: ResolvedPackageVersion = {
        name: spec.name,
        specifier,
        version,
        publishedAt: meta.time,
        lastSynced: data.lastSynced,
      }

      if (query.metadata) {
        Object.assign(result, meta)
      }

      return result
    },
  )
})
