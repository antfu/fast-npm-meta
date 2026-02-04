import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: 'node16',
  clean: true,
  rollup: {
    inlineDependencies: [
      'p-retry',
      'is-network-error',
    ],
    dts: {
      tsconfig: '../tsconfig.json',
    },
  },
})
