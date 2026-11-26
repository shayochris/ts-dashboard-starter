import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import * as Table from '#/components/table'
import { useServerTable } from '#/hooks/use-server-table'
import { fetchProducts } from '#/routes/products/-api'
import type { Product } from '#/routes/products/-api'

// Turns 1200 into "$1,200.00". Created once, outside the component (same reason as columns)
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const columnHelper = createColumnHelper<Product>()

const columns = [
  Table.createSelectionColumn<Product>(),
  columnHelper.accessor('id', { header: 'Id' }),
  columnHelper.accessor('title', {
    header: 'Title',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    // The VALUE is still the number 1200 (that's what CSV export gets); only the DISPLAY changes
    cell: (info) => priceFormatter.format(info.getValue()),
  }),
]

export const Route = createFileRoute('/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { table, query } = useServerTable({
    queryKey: ['products'],
    queryFn: fetchProducts,
    columns,
    initialColumnVisibility: { id: false },
  })

  return (
    <div className="p-12">
      <Table.Root table={table} query={query}>
        <Table.Toolbar>
          <Table.Search />
          <div className="flex items-center gap-2">
            <Table.BulkActions />
            <Table.ColumnVisibility />
          </div>
        </Table.Toolbar>

        {/* The page chooses the scroll height; the header sticks while rows scroll */}
        <Table.Content className="max-h-[480px]" />

        <Table.Footer>
          <Table.SelectedCount />
          <Table.PageSize />
          <Table.Pagination />
        </Table.Footer>
      </Table.Root>
    </div>
  )
}
