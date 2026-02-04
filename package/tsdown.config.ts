import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  exports: true,
  inlineOnly: [
    'p-retry',
    'is-network-error',
  ],
})
