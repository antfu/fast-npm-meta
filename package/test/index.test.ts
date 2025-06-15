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

// These tests verify a defensive mechanism for handling URL encoding variations
// in batch requests. The root cause of encoding inconsistencies is unclear, so
// this serves as a safety net until the underlying issue is identified.
// See: https://github.com/antfu/node-modules-inspector/issues/109
it.concurrent('batch URL encoding normalization', async () => {
  const { fetch: fetchApi } = globalThis

  const testCases = [
    { name: 'normal', url: `${apiEndpoint}/vite@5+vue@3` },
    { name: '%2B encoded', url: `${apiEndpoint}/vite@5%2Bvue@3` },
    { name: 'space converted', url: `${apiEndpoint}/vite@5%20vue@3` },
  ]

  for (const testCase of testCases) {
    const result = await fetchApi(testCase.url).then(r => r.json())
    expect(result, `Failed for ${testCase.name} case`)
      .toMatchObject([
        {
          name: 'vite',
          specifier: '5',
          version: expect.stringMatching(/^5\.\d+\.\d+$/),
          lastSynced: expect.any(Number),
        },
        {
          name: 'vue',
          specifier: '3',
          version: expect.stringMatching(/^3\.\d+\.\d+$/),
          lastSynced: expect.any(Number),
        },
      ])
  }
})

it.concurrent('versions URL encoding normalization', async () => {
  const { fetch: fetchApi } = globalThis

  const testCases = [
    { name: 'normal', url: `${apiEndpoint}/versions/vite@5+vue@3` },
    { name: '%2B encoded', url: `${apiEndpoint}/versions/vite@5%2Bvue@3` },
    { name: 'space converted', url: `${apiEndpoint}/versions/vite@5%20vue@3` },
  ]

  for (const testCase of testCases) {
    const result = await fetchApi(testCase.url).then(r => r.json())
    expect(result, `Failed for ${testCase.name} case`)
      .toMatchObject([
        {
          name: 'vite',
          specifier: '5',
          versions: expect.arrayContaining([expect.stringMatching(/^5\.\d+\.\d+$/)]),
          lastSynced: expect.any(Number),
        },
        {
          name: 'vue',
          specifier: '3',
          versions: expect.arrayContaining([expect.stringMatching(/^3\.\d+\.\d+$/)]),
          lastSynced: expect.any(Number),
        },
      ])
  }
})
