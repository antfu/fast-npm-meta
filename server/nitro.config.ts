import { execSync } from 'node:child_process'

const repoUrl = 'https://github.com/antfu/fast-npm-meta'
// eslint-disable-next-line node/prefer-global/process
const revision = process.env.GIT_REVISION || (() => {
  try {
    return execSync('git rev-parse HEAD').toString().trim()
  }
  catch {
    return 'unknown'
  }
})()

// https://nitro.build/config
export default defineNitroConfig({
  // eslint-disable-next-line node/prefer-global/process
  preset: process.env.NITRO_PRESET as any || 'netlify_edge',

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
