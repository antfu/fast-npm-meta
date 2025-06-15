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

  expect(await getLatestVersion('@antfu/some-private-package@0', { apiEndpoint, throw: false }))
    .toMatchObject({
      name: '@antfu/some-private-package@0',
      error: '[GET] \"https://registry.npmjs.org/@antfu/some-private-package\": 404 Not Found',
    })

  expect(await getLatestVersion('vite@2', { apiEndpoint, metadata: true }))
    .toMatchObject({
      name: 'vite',
      engines: { node: '>=12.2.0' },
      specifier: '2',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    })

  expect(await getLatestVersion('@antfu/some-private-package@0', { apiEndpoint, metadata: true, throw: false }))
    .toMatchObject({
      name: '@antfu/some-private-package@0',
      error: '[GET] \"https://registry.npmjs.org/@antfu/some-private-package\": 404 Not Found',
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

  expect(await getLatestVersionBatch(['vite@5', '@antfu/some-private-package@0', 'nuxt@~3.6'], { apiEndpoint, metadata: true, throw: false }))
    .toMatchObject([
      {
        name: 'vite',
        engines: expect.objectContaining({ node: '^18.0.0 || >=20.0.0' }),
        specifier: '5',
        version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        lastSynced: expect.any(Number),
      },
      {
        name: '@antfu/some-private-package@0',
        error: '[GET] \"https://registry.npmjs.org/@antfu/some-private-package\": 404 Not Found',
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
  await expect(getVersions('vite', { apiEndpoint }))
    .resolves
    .toMatchObject({
      name: 'vite',
      versions: expect.arrayContaining(['3.0.0']),
      lastSynced: expect.any(Number),
    })

  await expect(getVersions('@antfu/some-private-package', { apiEndpoint }))
    .rejects
    .toThrowErrorMatchingInlineSnapshot(`[Error: [GET] "https://registry.npmjs.org/@antfu/some-private-package": 404 Not Found]`)

  await expect(getVersions('@antfu/some-private-package', { apiEndpoint, throw: false }))
    .resolves
    .toMatchObject({
      name: '@antfu/some-private-package',
      error: '[GET] "https://registry.npmjs.org/@antfu/some-private-package": 404 Not Found',
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

  expect(await getVersions('@antfu/some-private-package', { apiEndpoint, metadata: true, throw: false }))
    .toMatchObject({
      name: '@antfu/some-private-package',
      error: '[GET] "https://registry.npmjs.org/@antfu/some-private-package": 404 Not Found',
    })
})
