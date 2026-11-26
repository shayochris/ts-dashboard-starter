import { Input } from '#/components/ui/input'
import type { TableQuery } from '#/hooks/use-client-table'
import { cn } from '#/lib/utils'
import { createContext } from '#/utils/create-context'
import { flexRender } from '@tanstack/react-table'
import type { ColumnDef, Table } from '@tanstack/react-table'
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  DownloadIcon,
  InboxIcon,
  LoaderIcon,
  SearchIcon,
  SearchXIcon,
  Settings2Icon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { downloadCsv, rowsToCsv } from './export-csv'
import { getPageItems } from './get-page-items'

const [TableProvider, useTableContext] = createContext<{
  table: Table<any>
  query: TableQuery<any>
}>('Table.Root')

// ----------------------------------------------------------------------
//  Root: shares { table, query } and draws the card frame
// ----------------------------------------------------------------------

export function TableRoot({
  table,
  query,
  children,
  className,
}: {
  table: Table<any>
  query: TableQuery<any>
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        // rounded border around everything; overflow-hidden clips the corners neatly
        'flex flex-col overflow-hidden rounded-lg border bg-background',
        className,
      )}
    >
      <TableProvider table={table} query={query}>
        {children}
      </TableProvider>
    </section>
  )
}

// ----------------------------------------------------------------------
//  Toolbar: the bar above the table
// ----------------------------------------------------------------------

export function TableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
      {children}
    </div>
  )
}

// ----------------------------------------------------------------------
//  Checkbox column
// ----------------------------------------------------------------------

/**
 * A ready-made checkbox column. Put it FIRST in a page's columns:
 *   const columns = [Table.createSelectionColumn<Product>(), ...]
 */
export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        label="Select all rows on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()} // "–" when only SOME are ticked
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label="Select row"
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
      />
    ),
  }
}

/**
 * A normal checkbox that can also show "–" (indeterminate).
 * HTML has no attribute for "–"; it can only be set from JavaScript,
 * which is why we reach the real <input> through `ref`.
 */
function Checkbox({
  label,
  checked,
  indeterminate = false,
  onChange,
}: {
  label: string
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className="size-4 cursor-pointer accent-primary"
      checked={checked}
      onChange={onChange}
      ref={(element) => {
        if (element) element.indeterminate = indeterminate
      }}
    />
  )
}

// ----------------------------------------------------------------------
//  Search: search icon that turns into a spinner while fetching
// ----------------------------------------------------------------------

export function TableSearch() {
  const { table, query } = useTableContext('Table.Search')

  const [text, setText] = useState<string>(table.getState().globalFilter ?? '')

  // Wait 400ms after the last keystroke before searching (debounce)
  useEffect(() => {
    const timer = setTimeout(() => table.setGlobalFilter(text), 400)
    return () => clearTimeout(timer)
  }, [text, table])

  // "fetching, but not the first load" → same rule as the table fade
  const isSearching = query.isFetching && !query.isLoading
  const Icon = isSearching ? LoaderIcon : SearchIcon

  return (
    // `relative` so the icon can be positioned INSIDE the input
    <div className="relative">
      <Icon
        className={cn(
          'pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground',
          isSearching && 'animate-spin',
        )}
      />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search..."
        className="h-9 w-64 pl-8" // pl-8 = room on the left for the icon
      />
    </div>
  )
}

// ----------------------------------------------------------------------
//  Bulk actions (only visible when something is ticked)
// ----------------------------------------------------------------------

export function TableBulkActions() {
  const { table, query } = useTableContext('Table.BulkActions')

  const selectedCount = query.selectedRows.length

  if (selectedCount === 0) return null

  const exportSelected = () => {
    const csv = rowsToCsv(table, query.selectedRows)
    downloadCsv(`export-${Date.now()}.csv`, csv) // Date.now() makes every filename unique
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={exportSelected}
        className="flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm hover:bg-muted"
      >
        <DownloadIcon className="size-4" />
        Export {selectedCount} to CSV
      </button>

      <button
        type="button"
        onClick={() => table.resetRowSelection()} // empties the selection (and the cart)
        className="flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm text-destructive hover:bg-destructive/10"
      >
        <XIcon className="size-4" />
        Clear selection
      </button>
    </div>
  )
}

// ----------------------------------------------------------------------
//  Columns menu: closes on outside click or Esc
// ----------------------------------------------------------------------

export function TableColumnVisibility() {
  const { table } = useTableContext('Table.ColumnVisibility')

  // A ref reaches the REAL <details> element, so we can check
  // "was the click inside it?" and close it ourselves
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    // Clicked somewhere on the page → if it wasn't inside the menu, close the menu
    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false
      }
    }

    // Pressed Esc → close the menu
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && detailsRef.current) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup: stop listening when this component disappears from the page
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, []) // [] = set the listeners up once, when the component first appears

  // Every column that's ALLOWED to be hidden (so not the checkbox column)
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  return (
    <details ref={detailsRef} className="relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-md border px-3 text-sm hover:bg-muted">
        <Settings2Icon className="size-4" />
        Columns
      </summary>

      <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
        <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">
          Show columns
        </p>

        {columns.map((column) => (
          <label
            key={column.id}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted"
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={column.getIsVisible()} // ticked = shown
              onChange={column.getToggleVisibilityHandler()} // click = show/hide this column
            />
            {/* Use the header text ("Price") if it's plain text, otherwise the column id */}
            {typeof column.columnDef.header === 'string'
              ? column.columnDef.header
              : column.id}
          </label>
        ))}
      </div>
    </details>
  )
}

// ----------------------------------------------------------------------
//  "3 row(s) selected"
// ----------------------------------------------------------------------

export function TableSelectedCount() {
  const { query } = useTableContext('Table.SelectedCount')

  const selectedCount = query.selectedRows.length

  if (selectedCount === 0) return null

  return (
    <p className="text-sm text-muted-foreground">
      {selectedCount} row(s) selected
    </p>
  )
}

// ----------------------------------------------------------------------
//  Content: scroll area, sticky header, rows and status messages
// ----------------------------------------------------------------------

export function TableContent({ className }: { className?: string }) {
  const { table, query } = useTableContext('Table.Content')

  const columnCount = table.getVisibleLeafColumns().length

  const search = table.getState().globalFilter

  // Which situation are we in? ORDER MATTERS: loading first, then error, then empty
  function renderBody() {
    if (query.isLoading) {
      return <SkeletonRows columnCount={columnCount} />
    }
    if (query.error) {
      return (
        <MessageRow
          columnCount={columnCount}
          icon={<TriangleAlertIcon className="size-6 text-destructive" />}
          title="Something went wrong"
          description={query.error.message}
        />
      )
    }
    if (query.items.length === 0 && search) {
      return (
        <MessageRow
          columnCount={columnCount}
          icon={<SearchXIcon className="size-6 text-muted-foreground" />}
          title="No results found"
          description={`Nothing matches "${search}". Try a different word.`}
        />
      )
    }
    if (query.items.length === 0) {
      return (
        <MessageRow
          columnCount={columnCount}
          icon={<InboxIcon className="size-6 text-muted-foreground" />}
          title="No data yet"
          description="There is nothing to show here yet."
        />
      )
    }
    return table.getRowModel().rows.map((row) => (
      <tr
        key={row.id}
        className={cn(
          'transition-colors hover:bg-muted/50', // light highlight under the mouse
          row.getIsSelected() && 'bg-primary/5 hover:bg-primary/5',
        )}
      >
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="border-b px-3 py-2.5">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ))
  }

  return (
    // The scroll area. The PAGE decides how tall it is via className (e.g. "max-h-[480px]").
    // If rows don't fit, only this box scrolls, not the whole page.
    <div className={cn('overflow-auto', className)}>
      <table
        className={cn(
          // border-separate + border-spacing-0: keeps the header's bottom line visible while it's "stuck"
          'w-full border-separate border-spacing-0 text-sm transition-opacity',
          query.isFetching && !query.isLoading && 'opacity-50',
        )}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const isSorted = header.column.getIsSorted()

                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      // sticky top-0 = "stay at the top of the scroll area while rows scroll under you"
                      // bg-muted is required, otherwise rows show THROUGH the header while scrolling
                      'sticky top-0 z-10 border-b bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground select-none',
                      canSort && 'cursor-pointer hover:text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      {/* ↑ / ↓ when sorted, faint ⇅ when sortable but not sorted yet */}
                      {isSorted === 'asc' ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : isSorted === 'desc' ? (
                        <ArrowDownIcon className="size-3.5" />
                      ) : canSort ? (
                        <ArrowUpDownIcon className="size-3.5 opacity-30" />
                      ) : null}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  )
}

// ----------------------------------------------------------------------
//  Footer
// ----------------------------------------------------------------------

export function TableFooter({ children }: { children: ReactNode }) {
  const { table, query } = useTableContext('Table.Footer')

  // Show the footer when there are pages to move through OR rows are ticked
  const hasManyPages = table.getPageCount() > 1
  const hasSelection = query.selectedRows.length > 0

  if (!hasManyPages && !hasSelection) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t px-3 py-2.5">
      {children}
    </div>
  )
}

// ----------------------------------------------------------------------
//  Pagination: « ‹ 1 2 3 4 5 … 20 › »
// ----------------------------------------------------------------------

export function TablePagination() {
  const { table } = useTableContext('Table.Pagination')

  const currentPage = table.getState().pagination.pageIndex + 1 // 0-based → 1-based for people
  const totalPages = table.getPageCount()

  if (totalPages <= 1) return null

  // Buttons show 1-based pages; TanStack wants a 0-based index
  const goToPage = (page: number) => table.setPageIndex(page - 1)

  const isFirstPage = !table.getCanPreviousPage()
  const isLastPage = !table.getCanNextPage()

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <PaginationArrowButton
        label="First page"
        disabled={isFirstPage}
        onClick={() => goToPage(1)}
      >
        <ChevronsLeftIcon className="size-4" />
      </PaginationArrowButton>

      <PaginationArrowButton
        label="Previous page"
        disabled={isFirstPage}
        onClick={() => table.previousPage()}
      >
        <ChevronLeftIcon className="size-4" />
      </PaginationArrowButton>

      {getPageItems(currentPage, totalPages).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => goToPage(item)}
            aria-current={item === currentPage ? 'page' : undefined} // tells screen readers "you are here"
            className={cn(
              'size-8 rounded-md text-sm',
              item === currentPage
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted/50',
            )}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            className="flex size-8 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ),
      )}

      <PaginationArrowButton
        label="Next page"
        disabled={isLastPage}
        onClick={() => table.nextPage()}
      >
        <ChevronRightIcon className="size-4" />
      </PaginationArrowButton>

      <PaginationArrowButton
        label="Last page"
        disabled={isLastPage}
        onClick={() => goToPage(totalPages)}
      >
        <ChevronsRightIcon className="size-4" />
      </PaginationArrowButton>
    </nav>
  )
}

// ----------------------------------------------------------------------
//  Rows per page
// ----------------------------------------------------------------------

export function TablePageSize() {
  const { table } = useTableContext('Table.PageSize')

  if (table.getPageCount() <= 1) return null

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Rows per page
      <select
        className="h-8 rounded-md border bg-background px-2 text-foreground"
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value)) // <select> gives text ("20"), so convert to a number
          table.setPageIndex(0) // new page size → start from page 1 again
        }}
      >
        {[10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  )
}

// ----------------------------------------------------------------------
//  Small private helpers
// ----------------------------------------------------------------------

function PaginationArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label} // icon-only buttons need a text label for screen readers
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

// One full-width row with an icon, a title and a description
function MessageRow({
  columnCount,
  icon,
  title,
  description,
}: {
  columnCount: number
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <tr>
      <td colSpan={columnCount} className="px-3 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            {icon}
          </div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </td>
    </tr>
  )
}

// Bars have different widths so the skeleton looks more like real text
const SKELETON_WIDTHS = ['60%', '80%', '45%', '70%']

function SkeletonRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_row, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columnCount }).map((_cell, cellIndex) => (
            <td key={cellIndex} className="border-b px-3 py-3">
              <div
                className="h-4 animate-pulse rounded bg-muted"
                // `style`, not a Tailwind class: Tailwind only creates classes it can SEE
                // written out in full in your code, so a width chosen while the app runs
                // like `w-[${x}]` would never exist
                style={{
                  width:
                    SKELETON_WIDTHS[
                      (rowIndex + cellIndex) % SKELETON_WIDTHS.length
                    ],
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
