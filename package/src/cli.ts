import process from 'node:process'
import { cac } from 'cac'
import { version } from '../package.json'
import { getLatestVersionBatch, getVersionsBatch } from './api'

const cli = cac('fast-npm-meta')

cli
  .command('version <...pkgs>', 'Get the latest version of one or more packages')
  .option('--json', 'Output as JSON')
  .option('--force', 'Bypass cache and get the latest data')
  .option('--metadata', 'Include version metadata (engines, deprecated, etc.)')
  .option('--api-endpoint <url>', 'API endpoint URL')
  .action(async (pkgs: string[], options: {
    json?: boolean
    force?: boolean
    metadata?: boolean
    apiEndpoint?: string
  }) => {
    try {
      const results = await getLatestVersionBatch(pkgs, {
        force: options.force,
        metadata: options.metadata as any,
        apiEndpoint: options.apiEndpoint,
      } as any)
      if (options.json) {
        const output = results.length === 1 ? results[0] : results
        console.log(JSON.stringify(output, null, 2))
      }
      else {
        for (const result of results)
          console.log((result as any).version)
      }
    }
    catch (e) {
      console.error((e as Error).message)
      process.exit(1)
    }
  })

cli
  .command('full <...pkgs>', 'Get full package metadata (versions list, dist-tags, etc.)')
  .option('--force', 'Bypass cache and get the latest data')
  .option('--loose', 'Include all versions that are newer than the specified version')
  .option('--metadata', 'Include per-version metadata (time, engines, deprecated, etc.)')
  .option('--after <date>', 'Only return versions published after this ISO date-time')
  .option('--api-endpoint <url>', 'API endpoint URL')
  .action(async (pkgs: string[], options: {
    force?: boolean
    loose?: boolean
    metadata?: boolean
    after?: string
    apiEndpoint?: string
  }) => {
    try {
      const results = await getVersionsBatch(pkgs, {
        force: options.force,
        loose: options.loose,
        metadata: options.metadata as any,
        after: options.after,
        apiEndpoint: options.apiEndpoint,
      } as any)
      const output = results.length === 1 ? results[0] : results
      console.log(JSON.stringify(output, null, 2))
    }
    catch (e) {
      console.error((e as Error).message)
      process.exit(1)
    }
  })

cli.help()
cli.version(version)
cli.parse()
