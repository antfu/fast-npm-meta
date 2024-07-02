import { execSync } from 'node:child_process'

const repoUrl = 'https://github.com/antfu/fast-npm-meta'
const revision = execSync('git rev-parse HEAD').toString().trim()

// https://nitro.unjs.io/config
export default defineNitroConfig({
  preset: 'netlify_edge',
  storage: {
    manifest: {
      driver: 'lruCache', // Switch to `redis`?
      max: 10_000,
    },
  },
  runtimeConfig: {
    app: {
      repoUrl,
      revision,
      deployTime: new Date().toISOString(),
    },
  },
})
