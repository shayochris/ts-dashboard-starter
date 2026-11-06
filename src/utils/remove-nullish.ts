/**
 * Removes nullish values from the input.
 *
 * @param {T} input - The input value that may contain nullish values.
 * @returns {T} - The input value with nullish values removed.
 */

export function removeNullish<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.filter((item) => item !== null).map(removeNullish) as T
  }

  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => [key, removeNullish(value)]),
    ) as T
  }

  return input
}
