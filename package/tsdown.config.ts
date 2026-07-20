import fs from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'tsdown'

const { dirname } = import.meta

export default defineConfig([
  {
    entry: ['src/index.ts'],
    dts: true,
    exports: true,
    deps: {
      onlyBundle: [
        'p-retry',
        'is-network-error',
      ],
    },
    hooks: {
      'build:done': async () => {
        // Copy skills from root folder to package/skills
        await fs.mkdir(join(dirname, 'skills/fast-npm-meta'), { recursive: true })
        await fs.copyFile(join(dirname, '../skills/fast-npm-meta/SKILL.md'), join(dirname, 'skills/fast-npm-meta/SKILL.md'))
      },
    },
  },
  {
    entry: { cli: 'src/cli.ts' },
    platform: 'node',
    dts: false,
    deps: {
      onlyBundle: [
        'p-retry',
        'is-network-error',
      ],
    },
    exports: true,
  },
])
