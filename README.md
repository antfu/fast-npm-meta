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

## API

An example server is deployed at https://npm.antfu.dev/. You can also deploy your own instance.

### `GET /:pkg`

#### Get the Latest Version

```sh
curl https://npm.antfu.dev/vite
```

Returns

```json
{
  "name": "vite",
  "specifier": "latest",
  "version": "5.3.2",
  "lastSynced": 1719798752827
}
```

#### Get the Latest Version of a Tag

```sh
curl https://npm.antfu.dev/vite@alpha
```

Returns

```json
{
  "name": "vite",
  "specifier": "alpha",
  "version": "6.0.0-alpha.18",
  "lastSynced": 1719798752827
}
```

#### Get the Latest Version of a Range

```sh
curl https://npm.antfu.dev/vite@^2.1.0
```

Returns

```json
{
  "name": "vite",
  "specifier": "^2.1.0",
  "version": "2.9.18",
  "lastSynced": 1719798752827
}
```

#### Resolve Multiple Packages

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
    "version": "6.0.0-alpha.18",
    "lastSynced": 1719798752827
  },
  {
    "name": "vue",
    "specifier": "latest",
    "version": "3.4.31",
    "lastSynced": 1719799051285
  },
  {
    "name": "nuxt",
    "specifier": "~3.11",
    "version": "3.11.2",
    "lastSynced": 1719799051232
  }
]
```

### `GET /versions/:pkg`

#### Get All Versions and Tags of a Package

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
    "0.1.2",
    "0.2.0",
    "0.3.0",
    "0.3.1",
    "0.3.2",
    "0.4.0"
    // ...
  ],
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

console.log({ version }) // 5.3.2
```

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
