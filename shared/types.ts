export interface PackageManifest {
  name: string
  distTags: Record<string, string> & {
    latest: string
  }
  versions: string[]
  time: Record<string, string> & {
    created: string
    modified: string
  }
  lastSynced: number
}

export interface PackageVersionsInfo extends PackageManifest {
  specifier: string
}

export interface PackageManifestError {
  error: string
  lastSynced: number
}

export interface ResolvedPackageVersion {
  name: string
  version: string | null
  specifier: string
  publishedAt: string | null
  lastSynced: number
}
