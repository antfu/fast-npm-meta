import parsePackage from 'npm-package-arg'
import semver from 'semver'
import { fetchPackageManifest } from '../utils/fetch'

export default eventHandler(async (event) => {
  async function getLatest(spec: string) {
    const parsed = parsePackage(spec)

    if (!parsed.name)
      throw new Error(`Invalid package name: ${spec}`)

    const data = await fetchPackageManifest(parsed.name)

    let version: string | null = null
    let specifier = 'latest'

    if (parsed.type === 'tag') {
      specifier = parsed.fetchSpec
      version = data.distTags[parsed.fetchSpec]
    }
    else if (parsed.type === 'range' && (parsed.fetchSpec === '*' || parsed.fetchSpec === 'latest')) {
      version = data.distTags.latest
      specifier = 'latest'
    }
    else if (parsed.type === 'range') {
      specifier = parsed.fetchSpec
      let maxVersion: string | null = data.distTags.latest
      if (!semver.satisfies(maxVersion, parsed.fetchSpec))
        maxVersion = null

      data.versions.forEach((ver) => {
        if (semver.satisfies(ver, parsed.fetchSpec)) {
          if (!maxVersion || semver.lte(ver, maxVersion))
            version = ver
        }
      })
    }
    else {
      throw new Error(`Unsupported spec: ${JSON.stringify(parsed)}`)
    }

    return {
      name: parsed.name,
      specifier,
      version,
      lastUpdated: data.lastUpdated,
    }
  }

  const pkgs = event.context.params.pkg
  if (pkgs.includes('+')) {
    return Promise.all(pkgs.split('+').map(getLatest))
  }
  else {
    return getLatest(pkgs)
  }
})
