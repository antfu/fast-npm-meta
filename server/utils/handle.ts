import type { EventHandlerRequest, H3Error, H3Event } from 'h3'
import type { Result as ParsedSpec } from 'npm-package-arg'
import type { QueryObject } from 'ufo'
import type { MaybeError, PackageError } from '../../shared/types'
import { createError, getQuery } from 'h3'
import parsePackage from 'npm-package-arg'

const DEFAULT_ERROR_STATUS = 400

export async function handlePackagesQuery<T extends object>(
  event: H3Event<EventHandlerRequest>,
  handler: (spec: ParsedSpec, query: QueryObject) => Promise<T>,
): Promise<MaybeError<T> | MaybeError<T>[] | H3Error> {
  const query = getQuery(event)

  const throwError = !(query.throw === 'false' || query.throw === false)

  // Normalize + separator encoding in batch requests (+ → %2B variations)
  // See: https://github.com/antfu/node-modules-inspector/issues/109
  const raw = decodeURIComponent(
    event.context.params.pkg.replace(/%2B/g, '+'),
  ).replace(/ /g, '+')

  const specs = raw.split('+').map(s => decodeURIComponent(s)).filter(Boolean)

  // Record the spec index to keep the result order consistent.
  const validSpecs: [idx: number, ParsedSpec][] = []
  const results = Array.from<MaybeError<T>>({ length: specs.length })

  for (const [idx, spec] of specs.entries()) {
    let parsedSpec: ParsedSpec
    try {
      // Throws if the package name is invalid
      parsedSpec = parsePackage(normalizeSemverRange(spec))
    }
    catch (error) {
      const result: PackageError = {
        status: DEFAULT_ERROR_STATUS,
        name: spec,
        error: retrieveErrorMessage(error),
      }
      if (throwError) {
        return createError({
          status: result.status,
          message: result.error,
        })
      }
      results[idx] = result
      continue
    }

    if (!parsedSpec.name) {
      const result: PackageError = {
        status: DEFAULT_ERROR_STATUS,
        name: spec,
        error: `Invalid package specifier: ${spec}`,
      }
      if (throwError) {
        return createError({
          status: result.status,
          message: result.error,
        })
      }
      results[idx] = result
      continue
    }

    validSpecs.push([idx, parsedSpec])
  }

  if (validSpecs.length) {
    await Promise.allSettled(
      validSpecs.map(async ([idx, parsedSpec]) =>
        handler(parsedSpec, query)
          .then((result) => {
            results[idx] = result
          })
          .catch((error) => {
            results[idx] = {
              status: error.status ?? DEFAULT_ERROR_STATUS,
              name: parsedSpec.raw,
              error: retrieveErrorMessage(error),
            }
          }),
      ),
    )
  }

  if (throwError) {
    for (const result of results) {
      if (result && 'error' in result) {
        return createError({
          status: result.status,
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

function normalizeSemverRange(spec: string): string {
  const lastAtIndex = spec.lastIndexOf('@')

  // exit early if no version part included
  if (lastAtIndex <= 0) {
    return spec
  }

  const pkg = spec.slice(0, lastAtIndex)
  const version = spec.slice(lastAtIndex + 1)

  const normalizedVersion = version
    // Normalize Hyphens: "1-3" → "1 - 3"
    .replace(/(?<=\d)-(?=\d)/g, (match, offset, str) => {
      // If preceded by a full x.y.z version, it's a pre-release tag - do not add spaces not to break it
      const before = str.slice(0, offset)
      return /\d+\.\d+\.\d+$/.test(before) ? match : ' - '
    })
    // Normalize Comparators: "pkg@>1<3" → "pkg@>1 <3"
    .replace(/(?<=[0-9x*])(?=[<>=^~])/gi, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()

  return `${pkg}@${normalizedVersion}`
}
