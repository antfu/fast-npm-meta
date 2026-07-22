const JSR_REGISTRY = 'https://npm.jsr.io/'
const JSR_PREFIX = 'jsr:'

export interface ResolvedPackageSpec {
  /** Resolved package name for registry lookup (e.g. @jsr/luca__flag) */
  registryName: string
  /** Original display name (e.g. @luca/flag) */
  displayName: string
  /** Registry URL to use */
  registry?: string
}

/**
 * Detect `jsr:` prefix and convert to npm-compat name.
 * e.g. `jsr:@luca/flag` → `@jsr/luca__flag` on `https://npm.jsr.io/`
 */
export function resolveJsrSpec(raw: string): ResolvedPackageSpec | null {
  if (!raw.startsWith(JSR_PREFIX))
    return null

  const jsrName = raw.slice(JSR_PREFIX.length)

  // JSR packages must be scoped: @scope/name
  const match = jsrName.match(/^@([^/]+)\/(.+)$/)
  if (!match)
    return null

  const [, scope, name] = match
  return {
    registryName: `@jsr/${scope}__${name}`,
    displayName: jsrName,
    registry: JSR_REGISTRY,
  }
}
