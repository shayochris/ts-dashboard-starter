import type { ErrorType } from '#/lib'
import type { Table } from '@tanstack/react-table'

export type TableRowId = string | number

export type TableRowData = { id: TableRowId }

export const toTableRowId = (id: TableRowId) => String(id)

export type TableWithSelection<T extends TableRowData> = Table<T> & {
  getSelectedRowIds: () => string[]
  getSelectedRows: () => T[]
  getExportableRowData: (row: T) => Record<string, unknown>
}

export type UseTableResult<T extends TableRowData> = {
  table: TableWithSelection<T>
  query: {
    items: T[]
    pagination: { currentPage: number; totalPages: number }
    isPlaceholderData: boolean
    isLoading: boolean
    isFetching: boolean
    error: ErrorType | null
    refetch: () => void
  }
}
