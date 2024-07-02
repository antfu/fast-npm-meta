import { expect, it } from 'vitest'
import { getLatestVersion, getLatestVersionBatch, getVersions } from '../src/api'

it.concurrent('latest', async () => {
  expect(await getLatestVersion('vite@2'))
    .toMatchObject({
      name: 'vite',
      specifier: '2',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    })

  expect(await getLatestVersionBatch(['vite', 'nuxt@~3.6']))
    .toMatchObject([
      {
        name: 'vite',
        specifier: 'latest',
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
})
