import { execSync } from 'node:child_process'

const repoUrl = 'https://github.com/antfu/fast-npm-meta'
const revision = execSync('git rev-parse HEAD').toString().trim()

// https://nitro.build/config
export default defineNitroConfig({
  preset: 'netlify_edge',

  storage: {
    manifest: {
      driver: 'lruCache', // Switch to `redis`?
      max: 10_000,
    },
  },

  routeRules: {
    '**': {
      cors: true,
    },
  },

  runtimeConfig: {
    app: {
      repoUrl,
      revision,
      deployTime: new Date().toISOString(),
      cacheTimeout: '',
      cacheTimeoutForce: '',
      registryUrl: '',
      registryUserAgent: '',
    },
  },

  compatibilityDate: '2025-03-28',
})
