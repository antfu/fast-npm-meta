import semver from 'semver'
import { fetchPackageManifest } from '../../utils/fetch'
import type { PackageVersionsInfo } from '../../../shared/types'
import { handlePackagesQuery } from '../../utils/handle'

export default eventHandler(async (event) => {
  const query = getQuery(event)

  return handlePackagesQuery<PackageVersionsInfo>(
    event,
    async (spec) => {
      const manifest = await fetchPackageManifest(spec.name, !!query.force)
      let versions = manifest.versions

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

      const versionsEngines = {}
      const time: PackageVersionsInfo['time'] = {
        created: manifest.time.created,
        modified: manifest.time.modified,
      }
      for (const ver of versions) {
        versionsEngines[ver] = manifest.versionsEngines[ver]
        time[ver] = manifest.time[ver]
      }

      return {
        name: spec.name,
        distTags: manifest.distTags,
        versions,
        versionsEngines,
        time,
        specifier: spec.fetchSpec,
        lastSynced: manifest.lastSynced,
      }
    },
  )
})
