export function mapEnginesWithVersions(versions: Packument['versions']) {
  const versionEnginesEntries = Object.entries(versions)
    .filter(([_, version]) => version.engines)
    .map(([name, version]) => [name, version.engines])

  return Object.fromEntries(versionEnginesEntries)
}
