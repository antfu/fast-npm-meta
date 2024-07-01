export interface PackageManifest {
  name: string
  distTags: Record<string, string> & {
    latest: string
  }
  versions: string[]
  lastSynced: number
}

export interface ResolvedPackageVersion {
  name: string
  version: string | null
  specifier: string
  lastSynced: string
}
