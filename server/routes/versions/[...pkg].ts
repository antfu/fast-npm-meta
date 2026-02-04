import type { PackageVersionsInfo, PackageVersionsInfoWithMetadata } from '../../../shared/types'
import semver from 'semver'
import { normalizeQueryDate } from '~/utils/date'
import { fetchPackageManifest } from '../../utils/fetch'
import { handlePackagesQuery } from '../../utils/handle'

export default eventHandler(async (event) => {
  return handlePackagesQuery<PackageVersionsInfoWithMetadata | PackageVersionsInfo>(
    event,
    async (spec, query) => {
      const manifest = await fetchPackageManifest(spec.name, !!query.force)
      let versions: string[] = Object.keys(manifest.versionsMeta)

      if (spec.type === 'range' && spec.fetchSpec !== '*') {
        const satisfiedVersions = versions.filter((ver) => {
          return semver.satisfies(ver, spec.fetchSpec)
        })
        if (query.loose) {
          versions = versions.filter((i) => {
            if (satisfiedVersions.includes(i))
              return true
            return satisfiedVersions.some(s => semver.lt(s, i))
          })
        }
        else {
          versions = satisfiedVersions
        }
      }
      else if (spec.type === 'tag') {
        const tag = manifest.distTags[spec.fetchSpec]
        if (tag) {
          versions = [tag]
        }
      }

      if (query.after) {
        const afterDate = normalizeQueryDate(query.after)
        if (afterDate) {
          versions = versions.filter((v) => {
            const meta = manifest.versionsMeta[v]
            return meta.time && new Date(meta.time) > afterDate
          })
        }
      }

      if (query.metadata) {
        return {
          name: spec.name,
          specifier: spec.fetchSpec,
          distTags: manifest.distTags,
          lastSynced: manifest.lastSynced,
          timeCreated: manifest.timeCreated,
          timeModified: manifest.timeModified,
          versionsMeta: Object.fromEntries(
            versions.map(v => [v, manifest.versionsMeta[v]]),
          ),
        } satisfies PackageVersionsInfoWithMetadata
      }

      return {
        name: spec.name,
        specifier: spec.fetchSpec,
        distTags: manifest.distTags,
        lastSynced: manifest.lastSynced,
        versions,
        time: {
          ...Object.fromEntries(
            versions.map(ver => [ver, manifest.versionsMeta[ver]?.time]),
          ),
          created: manifest.timeCreated,
          modified: manifest.timeModified,
        },
      } satisfies PackageVersionsInfo
    },
  )
})
