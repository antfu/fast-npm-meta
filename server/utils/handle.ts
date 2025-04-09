import type { EventHandlerRequest, H3Error, H3Event } from 'h3'
import type { Result as ParsedSpec } from 'npm-package-arg'
import type { QueryObject } from 'ufo'
import type { MaybeError } from '../../shared/types'
import { createError, getQuery } from 'h3'
import parsePackage from 'npm-package-arg'

export async function handlePackagesQuery<T extends object>(
  event: H3Event<EventHandlerRequest>,
  handler: (spec: ParsedSpec, query: QueryObject) => Promise<T>,
): Promise<MaybeError<T> | MaybeError<T>[] | H3Error> {
  const query = getQuery(event)

  const throwError = !(query.throw === 'false' || query.throw === false)

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
      const result = { name: spec, error: retrieveErrorMessage(error) }
      if (throwError) {
        return createError({
          status: 400,
          message: result.error,
        })
      }
      results[idx] = result
      continue
    }

    if (!parsedSpec.name) {
      const result = { name: spec, error: `Invalid package specifier: ${spec}` }
      if (throwError) {
        return createError({
          status: 400,
          message: result.error,
        })
      }
      results[idx] = result
      continue
    }

    validSpecs.push([idx, parsedSpec])
  }

  if (validSpecs.length) {
    await Promise.allSettled(validSpecs.map(async ([idx, parsedSpec]) =>
      handler(parsedSpec, query)
        .then((result) => {
          results[idx] = result
        })
        .catch((error) => {
          results[idx] = {
            name: parsedSpec.raw,
            error: retrieveErrorMessage(error),
          }
        }),
    ))
  }

  if (throwError) {
    for (const result of results) {
      if (result && 'error' in result) {
        return createError({
          status: 400,
          message: result.error,
        })
      }
    }
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
