import type { EventHandlerRequest, H3Error, H3Event } from 'h3'
import { createError } from 'h3'
import type { Result as ParsedSpec } from 'npm-package-arg'
import parsePackage from 'npm-package-arg'

export async function handlePackagesQuery<T>(
  event: H3Event<EventHandlerRequest>,
  handler: (spec: ParsedSpec) => Promise<T>,
): Promise<T | T[] | H3Error> {
  const raw = decodeURIComponent(event.context.params.pkg)

  if (raw.includes('+')) {
    const specs = raw.split('+').map(item => parsePackage(item))
    const invalid = specs.filter(spec => !spec.name)
    if (invalid.length) {
      return createError({
        status: 400,
        message: `Invalid package specifiers: ${invalid.map(i => i.raw).join(', ')}`,
      })
    }
    return await Promise.all(specs.map(handler))
  }
  else {
    const spec = parsePackage(raw)
    if (!spec.name) {
      return createError({
        status: 400,
        message: `Invalid package specifier: ${raw}`,
      })
    }
    return await handler(spec)
  }
}
