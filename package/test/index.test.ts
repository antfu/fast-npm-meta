import { expect, it } from 'vitest'
import { getLatestVersion, getLatestVersionBatch, getVersions } from '../src/api'

const apiEndpoint = 'http://localhost:12452'

it.concurrent('latest', async () => {
  expect(await getLatestVersion('vite@2', { apiEndpoint }))
    .toMatchObject({
      name: 'vite',
      specifier: '2',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    })

  expect(await getLatestVersion('vite@2', { apiEndpoint, metadata: true }))
    .toMatchObject({
      name: 'vite',
      engines: { node: '>=12.2.0' },
      specifier: '2',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    })

  expect(await getLatestVersionBatch(['vite@5', 'nuxt@~3.6'], { apiEndpoint, metadata: true }))
    .toMatchObject([
      {
        name: 'vite',
        engines: expect.objectContaining({ node: '^18.0.0 || >=20.0.0' }),
        specifier: '5',
        version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        lastSynced: expect.any(Number),
      },
      {
        name: 'nuxt',
        specifier: '~3.6',
        engines: expect.objectContaining({
          node: '^14.18.0 || >=16.10.0',
        }),
        version: expect.stringMatching(/^3\.6\.\d+$/),
        lastSynced: expect.any(Number),
      },
    ])
})

it.concurrent('versions', async () => {
  expect(await getVersions('vite', { apiEndpoint }))
    .toMatchObject({
      name: 'vite',
      versions: expect.arrayContaining(['3.0.0']),
      lastSynced: expect.any(Number),
    })

  expect(await getVersions('are-we-there-yet', { apiEndpoint, metadata: true }))
    .toMatchObject({
      name: 'are-we-there-yet',
      versionsMeta: expect.objectContaining({
        '4.0.2': {
          deprecated: 'This package is no longer supported.',
          engines: {
            node: '^14.17.0 || ^16.13.0 || >=18.0.0',
          },
          time: expect.any(String),
        },
      }),
      lastSynced: expect.any(Number),
    })
})
