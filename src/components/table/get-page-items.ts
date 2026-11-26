export type PageItem = number | 'ellipsis-left' | 'ellipsis-right'

// range(3, 6) → [3, 4, 5, 6]
function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

/**
 * current = the page you're on (1-based, like people count)
 * total   = how many pages exist
 * Always returns at most 7 items, so the buttons never jump around.
 */
export function getPageItems(current: number, total: number): PageItem[] {
  // 1. Few pages → show them all:  1 2 3 4 5
  if (total <= 7) {
    return range(1, total)
  }

  // 2. Near the START → no gap on the left:  1 2 3 4 5 … 20
  if (current <= 4) {
    return [...range(1, 5), 'ellipsis-right', total]
  }
  if (current >= total - 3) {
    return [1, 'ellipsis-left', ...range(total - 4, total)]
  }

  // 4. In the MIDDLE → gaps on both sides:  1 … 9 10 11 … 20
  return [
    1,
    'ellipsis-left',
    current - 1,
    current,
    current + 1,
    'ellipsis-right',
    total,
  ]
}
