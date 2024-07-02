export const NPM_REGISTRY = 'https://registry.npmjs.org/'

/**
 * Lightweight replacement of `npm-registry-fetch` function `pickRegistry`'
 *
 * @param scope - scope of package, get from 'npm-package-arg'
 * @param npmConfigs - npm configs, read from `.npmrc` file
 * @param defaultRegistry - default registry, default to 'https://registry.npmjs.org/'
 */
export function pickRegistry(
  scope: string | null | undefined,
  npmConfigs: Record<string, unknown>,
  defaultRegistry = NPM_REGISTRY,
): string {
  let registry: string | undefined = scope
    ? npmConfigs[`${scope.replace(/^@?/, '@')}:registry`] as string
    : undefined

  if (!registry && typeof npmConfigs.scope === 'string') {
    registry = npmConfigs[`${npmConfigs.scope.replace(/^@?/, '@')}:registry`] as string
  }

  if (!registry) {
    registry = npmConfigs.registry as string || defaultRegistry
  }

  return registry
}
