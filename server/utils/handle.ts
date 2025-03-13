import type { EventHandlerRequest, H3Event } from 'h3'
import type { Result as ParsedSpec } from 'npm-package-arg'
import parsePackage from 'npm-package-arg'
import type { MaybeError } from '../../shared/types'

export async function handlePackagesQuery<T>(
  event: H3Event<EventHandlerRequest>,
  handler: (spec: ParsedSpec) => Promise<T>,
): Promise<MaybeError<T> | MaybeError<T>[]> {
  const raw = decodeURIComponent(event.context.params.pkg)

  const specs = raw.split('+').filter(Boolean)

  // Record the spec index to keep the result order consistent.
  const validSpecs: [idx: number, ParsedSpec][] = []
  const results = Array.from<MaybeError<T>>({ length: specs.length })

  for (const [idx, spec] of specs.entries()) {
    let parsedSpec: ParsedSpec
    try {
      // Throws if the package name is invalid
      parsedSpec = parsePackage(spec)
    }
    catch (error) {
      results[idx] = { name: spec, error: retrieveErrorMessage(error) }
      continue
    }

    if (!parsedSpec.name) {
      results[idx] = { name: spec, error: `Invalid package specifier: ${spec}` }
      continue
    }

    validSpecs.push([idx, parsedSpec])
  }

  if (validSpecs.length) {
    await Promise.allSettled(validSpecs.map(async ([idx, parsedSpec]) => {
      await handler(parsedSpec)
        .then(result => results[idx] = result)
        .catch(error => results[idx] = {
          name: parsedSpec.raw,
          error: retrieveErrorMessage(error),
        })
    }))
  }

  return results.length === 1 ? results[0] : results
}

function retrieveErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  if (typeof error === 'object' && 'message' in error) {
    return error.message as string
  }
  return error ? String(error) : 'Unknown error'
}
