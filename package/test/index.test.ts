import { expect, it } from 'vitest'
import { getLatestVersion, getLatestVersionBatch, getVersions } from '../src/api'

it.concurrent('latest', async () => {
  expect(await getLatestVersion('vite@2'))
    .toMatchObject({
      name: 'vite',
      engines: { node: '>=12.2.0' },
      specifier: '2',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    })

  expect(await getLatestVersionBatch(['vite@5', 'nuxt@~3.6']))
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
        version: expect.stringMatching(/^3\.6\.\d+$/),
        lastSynced: expect.any(Number),
      },
    ])
})

it.concurrent('versions', async () => {
  expect(await getVersions('vite'))
    .toMatchObject({
      name: 'vite',
      versions: expect.arrayContaining(['3.0.0']),
      lastSynced: expect.any(Number),
    })

  expect(await getVersions('vite', { engines: '' }))
    .toMatchObject({
      name: 'vite',
      versionsEngines: expect.objectContaining({
        '3.0.0': {
          node: '>=14.18.0',
        },
      }),
      versions: expect.arrayContaining(['3.0.0']),
      lastSynced: expect.any(Number),
    })

  expect(await getVersions('vite', { engines: 'append' }))
    .toMatchObject({
      name: 'vite',
      versionsEngines: expect.objectContaining({
        '3.0.0': {
          node: '>=14.18.0',
        },
      }),
      versions: expect.arrayContaining(['3.0.0']),
      lastSynced: expect.any(Number),
    })

  expect(await getVersions('vite', { engines: 'concat' }))
    .toMatchObject({
      name: 'vite',
      versions: expect.objectContaining({
        '3.0.0': {
          node: '>=14.18.0',
        },
      }),
      lastSynced: expect.any(Number),
    })
})
