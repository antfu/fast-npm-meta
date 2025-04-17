/**
 * This utility helps safely extract a date from query params that may come
 * in various types. Since query values can be ambiguous or malformed
 * this function ensures only valid date values are passed to the Date
 * constructor, preventing "Invalid Date"
 */
export function normalizeQueryDate(input: unknown): Date | undefined {
  let raw: string | number | undefined

  if (Array.isArray(input)) {
    raw = input[0]
  }
  else if (typeof input === 'string' || typeof input === 'number') {
    raw = input
  }

  if (raw !== undefined && raw !== null && raw !== '') {
    const date = new Date(raw)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }
  return undefined
}
