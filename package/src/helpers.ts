export const NPM_REGISTRY = 'https://registry.npmjs.org/'

/**
 * Lightweight replacement of `npm-registry-fetch` function `pickRegistry`'
 *
 * @param scope - npm scope
 * @param npmConfigs - npm configs, read from `.npmrc` file
 */
export function pickRegistry(
  scope: string,
  npmConfigs: Record<string, string>,
  defaultRegistry = NPM_REGISTRY,
): string {
  let registry = scope && npmConfigs[`${scope.replace(/^@?/, '@')}:registry`]

  if (!registry && npmConfigs.scope) {
    registry = npmConfigs[`${npmConfigs.scope.replace(/^@?/, '@')}:registry`]
  }

  if (!registry) {
    registry = npmConfigs.registry || defaultRegistry
  }

  return registry
}
