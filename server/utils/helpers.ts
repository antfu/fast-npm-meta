import type { QueryObject } from 'ufo'
import { isString } from '@antfu/utils'

export function mapEnginesWithVersions(versions: Packument['versions']) {
  const versionEnginesEntries = Object.entries(versions)
    .filter(([_, version]) => version.engines)
    .map(([name, version]) => [name, version.engines])

  return Object.fromEntries(versionEnginesEntries)
}

export function handleOptions(query: QueryObject, handler: Record<string, Record<string, () => void> & {
  default?: () => void
}>) {
  if (!query) {
    return
  }
  for (const key in handler) {
    if (key in query && isString(query[key])) {
      const optionHandler = handler[key][query[key]]
      if (!optionHandler) {
        return createError({
          status: 400,
          message: `${query[key]} is not a valid value for ${key} query parameters. Valid values: ${Object.keys(handler[key])}`,
        })
      }
      optionHandler()
    }
    if (!(key in query) && 'default' in handler[key]) {
      handler[key].default()
    }
  }
}
