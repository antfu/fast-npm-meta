export interface PackageManifest {
  name: string
  distTags: Record<string, string> & {
    latest: string
  }
  versionsMeta: Record<string, PackageVersionMeta>
  timeCreated: string
  timeModified: string
  lastSynced: number
}

export type Engines = Partial<Record<string, string>>

export interface PackageVersionMeta {
  time?: string
  engines?: Engines
  deprecated?: string
}

export interface PackageVersionsInfo extends Pick<PackageManifest, 'name' | 'distTags' | 'lastSynced'> {
  versions: string[]
  specifier: string
  time: {
    created: string
    modified: string
  } & Record<string, string>
}

export interface PackageVersionsInfoWithMetadata extends PackageManifest {
  specifier: string
}

export interface PackageManifestError {
  error: string
  lastSynced: number
}

export interface ResolvedPackageVersion extends Partial<PackageVersionMeta> {
  name: string
  version: string | null
  specifier: string
  publishedAt: string | null
  lastSynced: number
}
