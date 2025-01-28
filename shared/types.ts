export interface PackageManifest {
  name: string
  versionsEngines?: Record<string, Record<string, string> & {
    node?: string
  }>
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

export interface PackageVersionsInfo extends Omit<PackageManifest, 'versions'> {
  versions: string[] | PackageManifest['versionsEngines']
  specifier: string
}

export interface PackageEnginesInfo extends Omit<PackageManifest, 'distTags' | 'versions' | 'time'> {}

export interface PackageManifestError {
  error: string
  lastSynced: number
}

export interface ResolvedPackageVersion {
  name: string
  engines?: Record<string, string>
  version: string | null
  specifier: string
  publishedAt: string | null
  lastSynced: number
}
