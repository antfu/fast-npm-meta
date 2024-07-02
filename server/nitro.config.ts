// https://nitro.unjs.io/config
export default defineNitroConfig({
  preset: 'netlify_edge',
  storage: {
    manifest: {
      driver: 'lruCache', // Switch to `redis`?
      max: 10_000,
    },
  },
})
