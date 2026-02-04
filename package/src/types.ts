import type { MaybeError, PackageVersionsInfo, PackageVersionsInfoWithMetadata, ResolvedPackageVersion, ResolvedPackageVersionWithMetadata } from '../../shared/types'

export * from '../../shared/types'

// explicitly only expose a subset of p-retry's types, in case we might want to swap the implementation
export interface RetryOptions {
  /**
   * The number of times to retry the operation.
   *
   * @default 5
   */
  retries?: number
  /**
   * The exponential factor to use.
   *
   * @default 2
   */
  factor?: number
  /**
   * The number of milliseconds before starting the first retry.
   *
   * Set this to `0` to retry immediately with no delay.
   *
   * @default 1000
   */
  minTimeout?: number
  /**
   * The maximum number of milliseconds between two retries.
   *
   * @default Infinity
   */
  maxTimeout?: number
  /**
   * Randomizes the timeouts by multiplying with a factor between 1 and 2.
   *
   * @default false
   */
  randomize?: boolean
}

export interface FetchOptions<Throw extends boolean = true> {
  /**
   * API endpoint for fetching package versions
   *
   * @default 'https://npm.antfu.dev/'
   */
  apiEndpoint?: string
  /**
   * Fetch function
   *
   * @default [globalThis.fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
   */
  fetch?: typeof fetch
  /**
   * Should throw error or return error object
   *
   * @default true
   */
  throw?: Throw
}

export interface GetVersionsOptions<
  Metadata extends boolean = false,
  Throw extends boolean = true,
> extends FetchOptions<Throw> {
  /**
   * By pass cache and get the latest data
   *
   * @default false
   */
  force?: boolean
  /**
   * Include all versions that are newer than the specified version
   *
   * @default false
   */
  loose?: boolean
  /**
   * Includes metadata, this will change the return type
   *
   * @default false
   */
  metadata?: Metadata
  /**
   * Only return versions published after this ISO date-time
   *
   * @default undefined
   */
  after?: string
  /**
   * Retry options for the built-in retry mechanism
   *
   * Can be:
   * - `RetryOptions` object for fine-grained control
   * - `number` for simple retry count (uses defaults for other options)
   * - `false` to disable retries
   */
  retry?: RetryOptions | number | false
}

export interface GetLatestVersionOptions<
  Metadata extends boolean = false,
  Throw extends boolean = true,
> extends FetchOptions<Throw> {
  /**
   * By pass cache and get the latest data
   *
   * @default false
   */
  force?: boolean
  /**
   * Includes metadata
   *
   * @default false
   */
  metadata?: Metadata
  /**
   * Retry options for the built-in retry mechanism
   *
   * Can be:
   * - `RetryOptions` object for fine-grained control
   * - `number` for simple retry count (uses defaults for other options)
   * - `false` to disable retries
   */
  retry?: RetryOptions | number | false
}

export type InferGetVersionsResult<Metadata, Throw> = Metadata extends true
  ? Throw extends true ? PackageVersionsInfoWithMetadata
    : MaybeError<PackageVersionsInfoWithMetadata>
  : Throw extends true ? PackageVersionsInfo
    : MaybeError<PackageVersionsInfo>

export type InferGetLatestVersionResult<Metadata, Throw> = Metadata extends true
  ? Throw extends true ? ResolvedPackageVersionWithMetadata
    : MaybeError<ResolvedPackageVersionWithMetadata>
  : Throw extends true ? ResolvedPackageVersion
    : MaybeError<ResolvedPackageVersion>
