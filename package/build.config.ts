import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/registry',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    dts: {
      tsconfig: '../tsconfig.json',
    },
  },
})
