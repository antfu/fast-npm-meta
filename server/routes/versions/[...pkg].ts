import parsePackage from 'npm-package-arg'
import { fetchPackageManifest } from '../../utils/fetch'

export default eventHandler(async (event) => {
  const query = getQuery(event)

  function getVersions(spec: string) {
    const parsed = parsePackage(spec)

    if (!parsed.name)
      throw new Error(`Invalid package name: ${spec}`)

    return fetchPackageManifest(parsed.name, !!query.force)
  }

  const pkgs = event.context.params.pkg
  if (pkgs.includes('+')) {
    return Promise.all(pkgs.split('+').map(getVersions))
  }
  else {
    return getVersions(pkgs)
  }
})
