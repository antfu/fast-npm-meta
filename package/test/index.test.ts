import { describe, expect, it } from 'vitest'
import {
  getLatestVersion,
  getLatestVersionBatch,
  getVersions,
} from '../src/api'

const apiEndpoint = 'http://localhost:12452'

it.concurrent('latest', async () => {
  expect(await getLatestVersion('vite@2', { apiEndpoint })).toMatchObject({
    name: 'vite',
    specifier: '2',
    version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
    lastSynced: expect.any(Number),
  })

  expect(
    await getLatestVersion('@antfu/some-private-package@0', {
      apiEndpoint,
      throw: false,
    }),
  ).toMatchObject({
    name: '@antfu/some-private-package@0',
    error:
      '[GET] \"https://registry.npmjs.org/@antfu/some-private-package\": 404 Not Found',
  })

  expect(
    await getLatestVersion('vite@2', { apiEndpoint, metadata: true }),
  ).toMatchObject({
    name: 'vite',
    engines: { node: '>=12.2.0' },
    specifier: '2',
    version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
    lastSynced: expect.any(Number),
  })

  expect(
    await getLatestVersion('@antfu/some-private-package@0', {
      apiEndpoint,
      metadata: true,
      throw: false,
    }),
  ).toMatchObject({
    name: '@antfu/some-private-package@0',
    error:
      '[GET] \"https://registry.npmjs.org/@antfu/some-private-package\": 404 Not Found',
  })

  expect(
    await getLatestVersionBatch(['vite@5', 'nuxt@~3.6'], {
      apiEndpoint,
      metadata: true,
    }),
  ).toMatchObject([
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

  expect(
    await getLatestVersionBatch(
      ['vite@5', '@antfu/some-private-package@0', 'nuxt@~3.6'],
      { apiEndpoint, metadata: true, throw: false },
    ),
  ).toMatchObject([
    {
      name: 'vite',
      engines: expect.objectContaining({ node: '^18.0.0 || >=20.0.0' }),
      specifier: '5',
      version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
    },
    {
      name: '@antfu/some-private-package@0',
      error:
        '[GET] \"https://registry.npmjs.org/@antfu/some-private-package\": 404 Not Found',
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

  expect(
    await getLatestVersion('vite@=7.0.3', { apiEndpoint, throw: false }),
  ).toMatchObject({
    name: 'vite',
    specifier: '=7.0.3',
    version: '7.0.3',
  })
})

it.concurrent('versions', async () => {
  await expect(getVersions('vite', { apiEndpoint })).resolves.toMatchObject({
    name: 'vite',
    versions: expect.arrayContaining(['3.0.0']),
    lastSynced: expect.any(Number),
  })

  await expect(
    getVersions('@antfu/some-private-package', { apiEndpoint }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: [GET] "https://registry.npmjs.org/@antfu/some-private-package": 404 Not Found]`,
  )

  await expect(
    getVersions('@antfu/some-private-package', { apiEndpoint, throw: false }),
  ).resolves.toMatchObject({
    name: '@antfu/some-private-package',
    error:
      '[GET] "https://registry.npmjs.org/@antfu/some-private-package": 404 Not Found',
  })

  expect(
    await getVersions('are-we-there-yet', { apiEndpoint, metadata: true }),
  ).toMatchObject({
    name: 'are-we-there-yet',
    versionsMeta: expect.objectContaining({
      '4.0.2': {
        deprecated: 'This package is no longer supported.',
        engines: {
          node: '^14.17.0 || ^16.13.0 || >=18.0.0',
        },
        integrity: expect.any(String),
        time: expect.any(String),
        provenance: true,
      },
    }),
    lastSynced: expect.any(Number),
  })

  expect(
    await getVersions('unplugin-vue', { apiEndpoint, metadata: true }),
  ).toMatchObject({
    name: 'unplugin-vue',
    versionsMeta: expect.objectContaining({
      '7.0.1': {
        engines: {
          node: '>=20.19.0',
        },
        time: expect.any(String),
        integrity: expect.any(String),
        provenance: 'trustedPublisher',
      },
    }),
    lastSynced: expect.any(Number),
  })

  expect(
    await getVersions('@antfu/some-private-package', {
      apiEndpoint,
      metadata: true,
      throw: false,
    }),
  ).toMatchObject({
    name: '@antfu/some-private-package',
    error:
      '[GET] "https://registry.npmjs.org/@antfu/some-private-package": 404 Not Found',
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
    expect(result, `Failed for ${testCase.name} case`).toMatchObject([
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
    expect(result, `Failed for ${testCase.name} case`).toMatchObject([
      {
        name: 'vite',
        specifier: '5',
        versions: expect.arrayContaining([
          expect.stringMatching(/^5\.\d+\.\d+$/),
        ]),
        lastSynced: expect.any(Number),
      },
      {
        name: 'vue',
        specifier: '3',
        versions: expect.arrayContaining([
          expect.stringMatching(/^3\.\d+\.\d+$/),
        ]),
        lastSynced: expect.any(Number),
      },
    ])
  }
})

describe.concurrent('semver range normalization', async () => {
  const { fetch: fetchApi } = globalThis

  it('comparator range without spaces', async () => {
    const result = await fetchApi(`${apiEndpoint}/vite@>=5.0.0<6.0.0`).then(
      r => r.json(),
    )
    expect(result).toMatchObject({
      name: 'vite',
      specifier: '>=5.0.0 <6.0.0',
      version: expect.stringMatching(/^5\.\d+\.\d+$/),
      lastSynced: expect.any(Number),
      publishedAt: expect.any(String),
    })
  })

  it('comparator range with spaces', async () => {
    const result = await fetchApi(
      `${apiEndpoint}/vite@>=5.0.0%20<6.0.0?throw=false`,
    ).then(r => r.json())
    expect(result).toMatchObject([
      {
        name: 'vite',
        specifier: '>=5.0.0',
        version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
        lastSynced: expect.any(Number),
        publishedAt: expect.any(String),
      },
      {
        error: 'Invalid package specifier: <6.0.0',
        name: '<6.0.0',
        status: 400,
      },
    ])
  })

  it('hyphen range without spaces', async () => {
    const result = await fetchApi(`${apiEndpoint}/vite@5.0-5.4`).then(r =>
      r.json(),
    )
    expect(result).toMatchObject({
      name: 'vite',
      specifier: '5.0 - 5.4',
      version: expect.stringMatching(/^5\.[0-4]\.\d+$/),
    })
  })

  it('hyphen range with spaces', async () => {
    const result = await fetchApi(
      `${apiEndpoint}/vite@5.0%20-%205.4?throw=false`,
    ).then(r => r.json())
    expect(result).toMatchObject([
      {
        name: 'vite',
        specifier: '5.0',
        version: '5.0.13',
        lastSynced: expect.any(Number),
        publishedAt: expect.any(String),
      },
      {
        error: 'Invalid package specifier: -',
        name: '-',
        status: expect.toBeOneOf([400, 404]),
      },
      {
        error: expect.any(String),
        name: '5.4',
        status: expect.toBeOneOf([400, 404]),
      },
    ])
  })
})

describe.concurrent('complex package names, complex versions', async () => {
  const { fetch: fetchApi } = globalThis
  const pkgName = '@rolldown/binding-win32-x64-msvc'

  it('multi-word package name without version', async () => {
    const result = await fetchApi(`${apiEndpoint}/${pkgName}`).then(r =>
      r.json(),
    )

    expect(result).toMatchObject({
      name: pkgName,
      specifier: 'latest',
      version: expect.any(String),
      lastSynced: expect.any(Number),
      publishedAt: expect.any(String),
    })
  })

  it('multi-word package name with caret range version', async () => {
    const result = await fetchApi(`${apiEndpoint}/${pkgName}@^0`).then(r =>
      r.json(),
    )
    expect(result).toMatchObject({
      name: pkgName,
      specifier: '^0',
      version: expect.any(String),
      lastSynced: expect.any(Number),
      publishedAt: expect.any(String),
    })
  })

  it('multi-word package name with hyphen range version', async () => {
    const result = await fetchApi(`${apiEndpoint}/${pkgName}@0-1`).then(r =>
      r.json(),
    )
    expect(result).toMatchObject({
      name: pkgName,
      specifier: '0 - 1',
      version: expect.any(String),
      lastSynced: expect.any(Number),
      publishedAt: expect.any(String),
    })
  })

  it('multi-word package name with pre release version with hyphen in specifier', async () => {
    const result = await fetchApi(`${apiEndpoint}/${pkgName}@1.0.0-pr.6`).then(
      r => r.json(),
    )
    expect(result).toMatchObject({
      name: pkgName,
      specifier: '1.0.0-pr.6',
      version: '1.0.0-pr.6',
      lastSynced: expect.any(Number),
    })
  })

  it('package with multi-word version with hyphen', async () => {
    const result = await fetchApi(
      `${apiEndpoint}/typescript@4.6.2-insiders.20220225`,
    ).then(r => r.json())
    expect(result).toMatchObject({
      name: 'typescript',
      specifier: '4.6.2-insiders.20220225',
      version: '4.6.2-insiders.20220225',
      lastSynced: expect.any(Number),
    })
  })

  it('package with multiple hyphens inside the identifier', async () => {
    const result = await fetchApi(
      `${apiEndpoint}/@graphql-codegen/cli@7.0.0-alpha-20260308111732-1c74ce2a5d8333d4f725c438ff9b6bbbf3e2386e`,
    ).then(r => r.json())
    expect(result).toMatchObject({
      name: '@graphql-codegen/cli',
      specifier: '7.0.0-alpha-20260308111732-1c74ce2a5d8333d4f725c438ff9b6bbbf3e2386e',
      version: '7.0.0-alpha-20260308111732-1c74ce2a5d8333d4f725c438ff9b6bbbf3e2386e',
      lastSynced: expect.any(Number),
    })
  })
})
