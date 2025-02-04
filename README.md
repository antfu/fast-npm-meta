# fast-npm-meta

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A lightweight API server to get npm package metadata, resolve the latest versions on server, and batch multiple package resolutions in one request.

## Motivation

NPM registry's API is fairly old and not very efficient. For example, requesting https://registry.npmjs.org/vite will make you download `4.38 MB` of data, which represents `36.32 MB` of uncompressed JSON data. This is a lot of data to download just to get the latest version of a single package.

<img width="280" alt="Screenshot of fetching npm registry" src="https://github.com/antfu/antfu/assets/11247099/32a0f8c3-1be9-440f-9cea-2cbfad4a0b47">

Also, if you try to fetch that metadata from the official [`pacote`](https://github.com/npm/pacote) library, you will end up pulling [118 dependencies](https://npmgraph.js.org/?q=pacote), which sums up to [`8.48 MB` of files](https://packagephobia.com/result?p=pacote) saved on your disk.

This project aims to provide a lightweight API server as the proxy, which caches the metadata from the NPM registry and provides a more efficient way to resolve the versions of the packages.

> [!IMPORTANT]
> This project is still in the early stage of development. Pin your dependencies on usage, and feedback are greatly welcomed.

## API Endpoints

An example server is deployed at https://npm.antfu.dev/. You can also deploy your own instance.

### `GET /:pkg`

#### 📦 Get the Latest Version

```sh
curl https://npm.antfu.dev/vite
```

Returns

```json
{
  "name": "vite",
  "specifier": "latest",
  "version": "6.0.6",
  "publishedAt": "2024-12-26T02:23:38.440Z",
  "lastSynced": 1735331047889
}
```

#### 📦 Get the Latest Version of a Tag

```sh
curl https://npm.antfu.dev/vite@alpha
```

Returns

```json
{
  "name": "vite",
  "specifier": "alpha",
  "version": "6.0.0-alpha.24",
  "publishedAt": "2024-09-04T09:15:20.820Z",
  "lastSynced": 1735331047889
}
```

#### 📦 Get the Latest Version of a Range

```sh
curl https://npm.antfu.dev/vite@^2.1.0
```

Returns

```json
{
  "name": "vite",
  "specifier": "^2.1.0",
  "version": "2.9.18",
  "publishedAt": "2024-03-24T15:06:20.353Z",
  "lastSynced": 1735496799048
}
```

#### 📦 Resolve Multiple Packages

Use `+` to separate the package specs.

```sh
curl https://npm.antfu.dev/vite@alpha+vue+nuxt@~3.11
```

Returns an array of objects:

```json
[
  {
    "name": "vite",
    "specifier": "alpha",
    "version": "6.0.0-alpha.24",
    "publishedAt": "2024-09-04T09:15:20.820Z",
    "lastSynced": 1735496799048
  },
  {
    "name": "vue",
    "specifier": "latest",
    "version": "3.5.13",
    "publishedAt": "2024-11-15T14:48:51.738Z",
    "lastSynced": 1735496870654
  },
  {
    "name": "nuxt",
    "specifier": "~3.11",
    "version": "3.11.2",
    "publishedAt": "2024-04-04T16:10:14.223Z",
    "lastSynced": 1735496870614
  }
]
```

#### 📦 Get Extra Metadata

You can pass `?metadata=true` to get additional metadata about the package, such as `engines`, `deprecated`, etc.

```sh
curl https://npm.antfu.dev/versions/vite@^2.1.0?metadata=true
```

```json
{
  "name": "vite",
  "engines": {
    "node": ">=12.2.0"
  },
  "specifier": "^2.1.0",
  "version": "2.9.18",
  "publishedAt": "2024-03-24T15:06:20.353Z",
  "lastSynced": 1735496799048
}
```

### `GET /versions/:pkg`

#### 📦 Get All Versions and Tags of a Package

```sh
curl https://npm.antfu.dev/versions/vite
```

```jsonc
{
  "name": "vite",
  "distTags": {
    "previous": "5.2.5",
    "alpha": "6.0.0-alpha.18",
    "beta": "5.3.0-beta.2",
    "latest": "5.3.2"
  },
  "versions": [
    "0.1.0",
    "0.1.1",
    "0.1.2"
    // ...
  ],
  "lastSynced": 1719801079260
}
```

#### 📦 Get Versions satisfies the Version Range

```sh
curl https://npm.antfu.dev/versions/vite@5
```

```jsonc
{
  "name": "vite",
  "distTags": {
    "previous": "5.2.5",
    "alpha": "6.0.0-alpha.18",
    "beta": "5.3.0-beta.2",
    "latest": "5.3.2"
  },
  "versions": [
    "5.0.0",
    "5.0.1",
    "5.0.2"
    // ...
  ],
  "lastSynced": 1719801079260
}
```

#### 📦 Get All Versions and Tags of Multiple Packages

Use `+` to separate the package names.

```sh
curl https://npm.antfu.dev/versions/vite+vue+nuxt
```

This will responses with an array

### 📦 Get Versions with Metadata

Add `?metadata=true` to the URL to get additional metadata about each version, such as `engines`, `deprecated`, etc.

This would also alter the response format. `versions` and `time` will be omitted, and instead a `versionsMeta` object will be returned.

```sh
curl https://npm.antfu.dev/versions/vite?metadata=true
```

```jsonc
{
  "name": "vite",
  "distTags": {
    "previous": "5.2.5",
    "alpha": "6.0.0-alpha.18",
    "beta": "5.3.0-beta.2",
    "latest": "5.3.2"
  },
  "versionsMeta": {
    "5.0.0": {
      "version": "5.0.0",
      "engines": {
        "node": ">=12.0.0"
      },
      "deprecated": "This version is deprecated"
    },
    "5.0.1": {
      "version": "5.0.1",
      "engines": {
        "node": ">=12.0.0"
      }
    }
    // ...
  },
  "lastSynced": 1719801079260
}
```

## JavaScript API

You can also use the JavaScript API to resolve the versions.

```bash
npm install fast-npm-meta
```

```ts
import { getLatestVersion } from 'fast-npm-meta'

const metadata = await getLatestVersion('vite')

console.log(metadata.version) // 5.3.2
```

## Configuration

The tool does not require any preliminary configuration to work, but you can override some default parameters through [environment variables or .env files](https://nitro.unjs.io/guide/configuration). The main ones:

| Option                | Description                      | Default                                |
|-----------------------|----------------------------------|----------------------------------------|
| `PORT`                | Port to listen on                | `3000`                                 |
| `HOST`                | Host to serve                    |                                        |
| `REPO_URL`            | Code reposotory URL              | https://github.com/antfu/fast-npm-meta |
| `CACHE_TIMEOUT`       | Cache timeout in ms              | `900000` (15m)                         |
| `CACHE_TIMEOUT_FORCE` | Cache timeout for forced updates | `30000` (30s)                          |
| `REGISTRY_URL`        | NPM registry URL                 | https://registry.npmjs.org             |
| `REGISTRY_USER_AGENT` | User agent for NPM registry requests | `get-npm-meta`                         |

For more information, follow [the official Nitro guides](https://nitro.unjs.io/deploy/runtimes/node#environment-variables).

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/fast-npm-meta?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/fast-npm-meta
[npm-downloads-src]: https://img.shields.io/npm/dm/fast-npm-meta?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/fast-npm-meta
[bundle-src]: https://img.shields.io/bundlephobia/minzip/fast-npm-meta?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=fast-npm-meta
[license-src]: https://img.shields.io/github/license/antfu/fast-npm-meta.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/fast-npm-meta/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/fast-npm-meta
