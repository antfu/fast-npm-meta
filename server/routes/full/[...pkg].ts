import type { PackageManifest } from '../../../shared/types'
import { fetchPackageManifest } from '../../utils/fetch'
import { handlePackagesQuery } from '../../utils/handle'

export default eventHandler(async (event) => {
  return handlePackagesQuery<PackageManifest>(
    event,
    (spec, query) => {
      return fetchPackageManifest(spec.name, !!query.force)
    },
  )
})
