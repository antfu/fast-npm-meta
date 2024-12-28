import semver from 'semver'
import type { H3Error } from 'h3'
import { fetchPackageManifest } from '../../utils/fetch'
import type { PackageVersionsInfo } from '../../../shared/types'
import { handlePackagesQuery } from '../../utils/handle'
import { handleOptions } from '~/utils/helpers'

export default eventHandler(async (event) => {
  const query = getQuery(event)

  return handlePackagesQuery<PackageVersionsInfo | H3Error>(
    event,
    async (spec) => {
      const manifest = await fetchPackageManifest(spec.name, !!query.force)
      let versions: string[] | Packument['engines'] = manifest.versions

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

      let versionsEngines: Packument['engines'] = {}
      const time: PackageVersionsInfo['time'] = {
        created: manifest.time.created,
        modified: manifest.time.modified,
      }
      for (const ver of versions) {
        versionsEngines[ver] = manifest.versionsEngines[ver]
        time[ver] = manifest.time[ver]
      }

      const error = handleOptions(query, {
        engines: {
          'concat': () => {
            versions = versionsEngines
            versionsEngines = undefined
          },
          'append': () => null,
          '': () => null,
          'default': () => {
            versionsEngines = undefined
          },
        },
      })
      if (error) {
        return createError(error)
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
