import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

import type { TableQuery } from '#/hooks/use-client-table'

export type ServerTableParams = {
  q?: string
  sort?: string
  page?: number
  size?: number
}

export type ServerTableResponse<TData> = {
  data: TData[]
  pagination?: { currentPage: number; totalPages: number }
}

type UseServerTableOptions<TData> = {
  queryKey: string[]
  queryFn: (params: ServerTableParams) => Promise<ServerTableResponse<TData>>
  columns: ColumnDef<TData, any>[]
  initialPageSize?: number
  initialColumnVisibility?: VisibilityState
}

const NO_ROWS: any[] = []

export function useServerTable<TData extends { id: string | number }>({
  queryKey,
  queryFn,
  columns,
  initialPageSize = 10,
  initialColumnVisibility,
}: UseServerTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  // NEW: the "shopping cart" → { "1": {…product 1…}, "25": {…product 25…} }
  // Keeps the FULL row of everything ticked, even after you leave its page.
  const [selectedById, setSelectedById] = useState<Record<string, TData>>({})

  // NEW: TanStack only needs the ids, so build { "1": true, "25": true } from the cart
  const rowSelection: RowSelectionState = {}
  for (const id of Object.keys(selectedById)) {
    rowSelection[id] = true
  }

  const goToFirstPage = () => setPagination((old) => ({ ...old, pageIndex: 0 }))

  const params: ServerTableParams = {
    q: globalFilter || undefined,
    sort: sorting[0]
      ? `${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}`
      : undefined,
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  }

  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  const rows: TData[] = query.data?.data ?? NO_ROWS

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter, pagination, rowSelection }, // NEW: rowSelection
    onSortingChange: (updater) => {
      setSorting(updater)
      goToFirstPage()
    },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater)
      goToFirstPage()
    },
    onPaginationChange: setPagination,

    // NEW: runs whenever a checkbox is ticked or unticked
    onRowSelectionChange: (updater) => {
      // 1. Work out the new { id: true } list. `updater` may be a value or a function (see Milestone 7)
      const nextSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater

      // 2. Rebuild the cart from it
      const nextCart: Record<string, TData> = {}
      for (const [id, isSelected] of Object.entries(nextSelection)) {
        if (!isSelected) continue

        // Already in the cart (e.g. picked on another page)? Keep that copy.
        // Newly ticked? It's on THIS page right now, so find it in `rows`.
        const row =
          id in selectedById
            ? selectedById[id]
            : rows.find((r) => String(r.id) === id)
        if (row) nextCart[id] = row // never put `undefined` in the cart (it would crash the export)
      }

      setSelectedById(nextCart)
    },

    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount: query.data?.pagination?.totalPages ?? 0,
    getRowId: (row) => String(row.id),
    initialState: { columnVisibility: initialColumnVisibility },
  })

  const tableQuery: TableQuery<TData> = {
    items: rows,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    selectedRows: Object.values(selectedById), // NEW: everything in the cart, from every page
  }

  return { table, query: tableQuery }
}
