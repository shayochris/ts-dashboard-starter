import { useState } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'

// What a page must give the hook
type UseClientTableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  isLoading?: boolean
  error?: Error | null
}

type TableRowId = { id: string | number }

export type TableQuery<TData> = {
  items: TData[]
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  selectedRows: TData[]
}

export function useClientTable<TData extends TableRowId>({
  data,
  columns,
  isLoading = false,
  error = null,
}: UseClientTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    getRowId: (row) => String(row.id),
  })

  const items = table.getFilteredRowModel().rows.map((row) => row.original)

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)

  const query: TableQuery<TData> = {
    items,
    isLoading,
    isFetching: false,
    error,
    selectedRows,
  }

  return {
    table,
    query,
  }
}
