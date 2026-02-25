import fs from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

const dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig([
  {
    entry: ['src/index.ts'],
    clean: true,
    dts: true,
    exports: true,
    inlineOnly: [
      'p-retry',
      'is-network-error',
    ],
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
    inlineOnly: [
      'cac',
      'p-retry',
      'is-network-error',
    ],
    banner: { js: '#!/usr/bin/env node' },
  },
])
