// https://nitro.unjs.io/config
export default defineNitroConfig({
  storage: {
    manifest: {
      driver: 'lruCache',
    },
  },
})
