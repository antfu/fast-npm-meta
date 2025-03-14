import { execSync } from 'node:child_process'

/**
 * Get the npm registry URL.
 *
 * @param scope - scope of package
 * @returns registry URL
 */
export function getRegistry(scope?: string) {
  const defaultRegistry = execSync('npm config get registry').toString().trim()

  if (scope) {
    scope = scope.replace(/^@?/, '@')
    const scopeRegistry = execSync(`npm config get ${scope}:registry`).toString().trim()
    return scopeRegistry || defaultRegistry
  }

  return defaultRegistry
}
