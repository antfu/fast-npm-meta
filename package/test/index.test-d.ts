import type { MaybeError, PackageVersionsInfo, PackageVersionsInfoWithMetadata, ResolvedPackageVersionWithMetadata } from '../../shared/types'
import type { ResolvedPackageVersion } from '../src'
import { describe, expectTypeOf, it } from 'vitest'
import { getLatestVersion, getLatestVersionBatch, getVersions, getVersionsBatch } from '../src'

describe('types', () => {
  it('latest', () => {
    expectTypeOf(getLatestVersion('vite@2'))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersion>()

    expectTypeOf(getLatestVersion('vite@2', { metadata: true }))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersionWithMetadata>()

    expectTypeOf(getLatestVersion('vite@2', { metadata: false }))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersion>()

    expectTypeOf(getLatestVersion('vite@2', { throw: true }))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersion>()

    expectTypeOf(getLatestVersion('vite@2', { throw: false }))
      .resolves
      .toEqualTypeOf<MaybeError<ResolvedPackageVersion>>()
  })

  it('latest batch', () => {
    expectTypeOf(getLatestVersionBatch(['vite@2']))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersion[]>()

    expectTypeOf(getLatestVersionBatch(['vite@2'], { metadata: true }))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersionWithMetadata[]>()

    expectTypeOf(getLatestVersionBatch(['vite@2'], { metadata: false }))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersion[]>()

    expectTypeOf(getLatestVersionBatch(['vite@2'], { throw: true }))
      .resolves
      .toEqualTypeOf<ResolvedPackageVersion[]>()

    expectTypeOf(getLatestVersionBatch(['vite@2'], { throw: false }))
      .resolves
      .toEqualTypeOf<MaybeError<ResolvedPackageVersion>[]>()
  })

  it('versions', () => {
    expectTypeOf(getVersions('vite@2'))
      .resolves
      .toEqualTypeOf<PackageVersionsInfo>()

    expectTypeOf(getVersions('vite@2', { metadata: true }))
      .resolves
      .toEqualTypeOf<PackageVersionsInfoWithMetadata>()

    expectTypeOf(getVersions('vite@2', { metadata: false }))
      .resolves
      .toEqualTypeOf<PackageVersionsInfo>()

    expectTypeOf(getVersions('vite@2', { throw: true }))
      .resolves
      .toEqualTypeOf<PackageVersionsInfo>()

    expectTypeOf(getVersions('vite@2', { throw: false }))
      .resolves
      .toEqualTypeOf<MaybeError<PackageVersionsInfo>>()
  })

  it('versions batch', () => {
    expectTypeOf(getVersionsBatch(['vite@2']))
      .resolves
      .toEqualTypeOf<PackageVersionsInfo[]>()

    expectTypeOf(getVersionsBatch(['vite@2'], { metadata: true }))
      .resolves
      .toEqualTypeOf<PackageVersionsInfoWithMetadata[]>()

    expectTypeOf(getVersionsBatch(['vite@2'], { metadata: false }))
      .resolves
      .toEqualTypeOf<PackageVersionsInfo[]>()

    expectTypeOf(getVersionsBatch(['vite@2'], { throw: true }))
      .resolves
      .toEqualTypeOf<PackageVersionsInfo[]>()

    expectTypeOf(getVersionsBatch(['vite@2'], { throw: false }))
      .resolves
      .toEqualTypeOf<MaybeError<PackageVersionsInfo>[]>()
  })
})
