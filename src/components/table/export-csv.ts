import type { Table } from '@tanstack/react-table'

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  const text = String(value)

  // Has a comma, a quote or a line break? → wrap it in quotes so it stays in ONE box.
  // Any quote inside is doubled ("" means one real "), so Excel doesn't think the value ended early.
  if (/[",\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"'
  }

  return text
}

export function rowsToCsv<TData>(table: Table<TData>, rows: TData[]) {
  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.accessorFn)

  // First line: the column titles, e.g.  Id,Title,Price
  const headerLine = columns
    .map((column) =>
      escapeCsvValue(
        typeof column.columnDef.header === 'string'
          ? column.columnDef.header
          : column.id,
      ),
    )
    .join(',')

  // One line per row, e.g.  12,Mouse 12,57
  const rowLines = rows.map((row, index) =>
    columns
      .map((column) => escapeCsvValue(column.accessorFn!(row, index)))
      .join(','),
  )

  return [headerLine, ...rowLines].join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url) // free the memory
}
