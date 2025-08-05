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
  provenance?: 'trustedPublisher' | boolean
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

export interface PackageError {
  name: string
  error: string
}

export type MaybeError<T> = T | PackageError

export interface PackageManifestError extends PackageError {
  lastSynced: number
}

export interface ResolvedPackageVersion {
  name: string
  version: string | null
  specifier: string
  publishedAt: string | null
  lastSynced: number
}

export interface ResolvedPackageVersionWithMetadata extends ResolvedPackageVersion, PackageVersionMeta {}
