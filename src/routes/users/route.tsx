import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'

import * as Table from '#/components/table'
import { useClientTable } from '#/hooks/use-client-table'

type Person = {
  id: number
  name: string
  email: string
  age: number
  phone?: string
}

const people: Person[] = [
  {
    id: 1,
    name: 'james',
    email: 'james@gmail.com',
    age: 17,
    phone: '0712 000 000',
  },
  {
    id: 2,
    name: 'john',
    email: 'john@gmail.com',
    age: 20,
    phone: '0712 000 000',
  },
  {
    id: 3,
    name: 'alex',
    email: 'alex@gmail.com',
    age: 18,
    phone: '0712 000 000',
  },
  {
    id: 4,
    name: 'jane',
    email: 'jane@gmail.com',
    age: 19,
    phone: '0712 000 000',
  },
]

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.accessor('id', { header: 'Id' }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('phone', { header: 'Phone' }),
  columnHelper.accessor('age', {
    header: 'Age',
    cell: (data) => <p>{data.row.original.age} Years</p>,
  }),
]

export const Route = createFileRoute('/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const { table, query } = useClientTable({
    data: people,
    columns,
  })

  return (
    <div className="p-12">
      <Table.Root table={table} query={query}>
        <Table.Toolbar>
          <Table.Search />
          <Table.ColumnVisibility />
        </Table.Toolbar>
        <Table.Content />
      </Table.Root>
    </div>
  )
}
