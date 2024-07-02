import { fetchPackageManifest } from '../../utils/fetch'
import type { PackageManifest } from '../../../shared/types'
import { handlePackagesQuery } from '../../utils/handle'

export default eventHandler(async (event) => {
  const query = getQuery(event)

  return handlePackagesQuery<PackageManifest>(
    event,
    (spec) => {
      return fetchPackageManifest(spec.name, !!query.force)
    },
  )
})
