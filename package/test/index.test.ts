import { expect, it } from 'vitest'
import { getLatestVersion, getLatestVersions } from '../src'

it('works', async () => {
  expect(await getLatestVersion('vite@2'))
    .toMatchObject({
      name: 'vite',
      specifier: '2',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    })

  expect(await getLatestVersions(['vite', 'nuxt@~3.6']))
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
