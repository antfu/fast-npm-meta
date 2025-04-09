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

export interface Packument {
  'name': string
  /**
   * An object where each key is a version, and each value is the engines for
   * that version.
   */
  'engines': Record<string, string>
  /**
   * An object where each key is a version, and each value is the manifest for
   * that version.
   */
  'versions': Record<string, Omit<Packument, 'versions'>>
  /**
   * An object mapping dist-tags to version numbers. This is how `foo@latest`
   * gets turned into `foo@1.2.3`.
   */
  'dist-tags': { latest: string } & Record<string, string>
  /**
   * Deprecated message for the package.
   */
  'deprecated'?: string
  /**
   * In the full packument, an object mapping version numbers to publication
   * times, for the `opts.before` functionality.
   */
  'time': Record<string, string> & {
    created: string
    modified: string
  }
}

export interface ResolvedPackageVersionWithMetadata extends ResolvedPackageVersion, PackageVersionMeta {}
