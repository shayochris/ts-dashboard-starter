# Table

A reusable data table built on [TanStack Table v8](https://tanstack.com/table/v8).

It has two parts:

1. **A hook** that holds the logic (state, fetching, selection). Pick one:
   - `useClientTable`: the data is **already in the browser** (an array you have).
   - `useServerTable`: the data lives **on a server** that searches, sorts and pages it.
2. **`Table.*` components** that draw the UI. They work with **either** hook.

Both hooks return the same thing, `{ table, query }`, and every `Table.*`
component reads it from `Table.Root`. That shared shape is why the UI pieces
don't care which hook you used.

```
useClientTable / useServerTable  ──►  { table, query }  ──►  <Table.Root>
                                                                ├─ Table.Toolbar / Search / BulkActions / ColumnVisibility
                                                                ├─ Table.Content
                                                                └─ Table.Footer / SelectedCount / PageSize / Pagination
```

---

## Which hook should I use?

| Feature                                 | `useClientTable`              | `useServerTable`                           |
| --------------------------------------- | ----------------------------- | ------------------------------------------ |
| Where the data comes from               | An array you pass in (`data`) | A function you pass in (`queryFn`)         |
| Search (`Table.Search`)                 | ✅ Done in the browser        | ✅ Sent to the server as `q`               |
| Sort by clicking a header               | ✅ Done in the browser        | ✅ Sent to the server as `sort`            |
| Pagination (`Table.Pagination`)         | ❌ Shows all rows             | ✅ Sent to the server as `page` and `size` |
| Rows per page (`Table.PageSize`)        | ❌                            | ✅                                         |
| Back to page 1 when search/sort changes | n/a                           | ✅ Automatic                               |
| Row selection (checkboxes)              | ✅                            | ✅ Remembered **across pages**             |
| Export selected rows to CSV             | ✅                            | ✅ Includes rows ticked on other pages     |
| Show/hide columns                       | ✅                            | ✅                                         |
| Start with some columns hidden          | ❌                            | ✅ `initialColumnVisibility`               |
| Loading skeleton                        | ✅ If you pass `isLoading`    | ✅ Automatic on first load                 |
| Error message                           | ✅ If you pass `error`        | ✅ Automatic when `queryFn` throws         |
| Fade + search spinner while refetching  | ❌ Never refetches            | ✅ Automatic                               |
| Caching                                 | n/a                           | ✅ React Query, fresh for 30 seconds       |

**Rule of thumb:** a few hundred rows or fewer that you already have → `useClientTable`.
Anything that comes from an API or could grow large → `useServerTable`.

---

## Quick start: client table

```tsx
import { createColumnHelper } from '@tanstack/react-table'

import * as Table from '#/components/table'
import { useClientTable } from '#/hooks/use-client-table'

type Person = { id: number; name: string; email: string }

const people: Person[] = [
  { id: 1, name: 'James', email: 'james@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
]

const columnHelper = createColumnHelper<Person>()

// Define columns OUTSIDE the component (see "Rules" below)
const columns = [
  Table.createSelectionColumn<Person>(), // optional: checkbox column
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
]

function PeoplePage() {
  const { table, query } = useClientTable({ data: people, columns })

  return (
    <Table.Root table={table} query={query}>
      <Table.Toolbar>
        <Table.Search />
        <div className="flex items-center gap-2">
          <Table.BulkActions />
          <Table.ColumnVisibility />
        </div>
      </Table.Toolbar>

      <Table.Content />

      <Table.Footer>
        <Table.SelectedCount />
      </Table.Footer>
    </Table.Root>
  )
}
```

## Quick start: server table

```tsx
import { createColumnHelper } from '@tanstack/react-table'

import * as Table from '#/components/table'
import { useServerTable } from '#/hooks/use-server-table'
import { fetchProducts, type Product } from './-api'

const columnHelper = createColumnHelper<Product>()

const columns = [
  Table.createSelectionColumn<Product>(),
  columnHelper.accessor('id', { header: 'Id' }),
  columnHelper.accessor('title', { header: 'Title' }),
  columnHelper.accessor('price', { header: 'Price' }),
]

function ProductsPage() {
  const { table, query } = useServerTable({
    queryKey: ['products'],
    queryFn: fetchProducts,
    columns,
    initialColumnVisibility: { id: false }, // optional
  })

  return (
    <Table.Root table={table} query={query}>
      <Table.Toolbar>
        <Table.Search />
        <div className="flex items-center gap-2">
          <Table.BulkActions />
          <Table.ColumnVisibility />
        </div>
      </Table.Toolbar>

      <Table.Content className="max-h-[480px]" />

      <Table.Footer>
        <Table.SelectedCount />
        <Table.PageSize />
        <Table.Pagination />
      </Table.Footer>
    </Table.Root>
  )
}
```

A working example lives in `src/routes/products/` (server) and `src/routes/users/route.tsx` (client).

---

## `useClientTable` options

| Option      | Type                      | Required | What it does                                                                     |
| ----------- | ------------------------- | -------- | -------------------------------------------------------------------------------- |
| `data`      | `TData[]`                 | ✅       | The rows. Every row **must** have a unique `id`.                                 |
| `columns`   | `ColumnDef<TData, any>[]` | ✅       | The column definitions.                                                          |
| `isLoading` | `boolean`                 |          | Show the loading skeleton (e.g. while the array is being loaded from somewhere). |
| `error`     | `Error \| null`           |          | Show the error message instead of rows.                                          |

How it behaves:

- Search matches any column's text (`includesString`), ignoring upper/lower case.
- Clicking a header cycles: ascending → descending → unsorted.

## `useServerTable` options

| Option                    | Type                                                          | Required | What it does                                                                 |
| ------------------------- | ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `queryKey`                | `string[]`                                                    | ✅       | React Query cache label, e.g. `['products']`. Must be unique per table.      |
| `queryFn`                 | `(params: ServerTableParams) => Promise<ServerTableResponse>` | ✅       | Fetches one page. See "The server contract" below.                           |
| `columns`                 | `ColumnDef<TData, any>[]`                                     | ✅       | The column definitions.                                                      |
| `initialPageSize`         | `number`                                                      |          | Rows per page to start with. Default `10`.                                   |
| `initialColumnVisibility` | `Record<columnId, boolean>`                                   |          | Columns to start hidden, e.g. `{ id: false }`. Users can still turn them on. |

### The server contract

Your `queryFn` **receives** these params (all optional):

| Param  | Example        | Meaning                                                                              |
| ------ | -------------- | ------------------------------------------------------------------------------------ |
| `q`    | `'laptop'`     | Search text. Missing when the search box is empty.                                   |
| `sort` | `'price,desc'` | `columnId,asc` or `columnId,desc`. Missing when unsorted. Only one column at a time. |
| `page` | `1`            | Which page, **starting from 1**.                                                     |
| `size` | `10`           | Rows per page.                                                                       |

…and **must return**:

```ts
{
  data: TData[]                                         // just this page's rows
  pagination: { currentPage: number; totalPages: number } // how many pages exist in total
}
```

If your API returns a different shape, convert it inside `queryFn`:

```ts
queryFn: async (params) => {
  const res = await api.get('/products', { params })
  return {
    data: res.items,
    pagination: { currentPage: res.page, totalPages: res.totalPages },
  }
}
```

To show an error in the table, just **throw** inside `queryFn`. React Query retries
3 times first (a few seconds) and then the table shows "Something went wrong".

How it behaves:

- The table does **no** searching, sorting or paging itself (`manualSorting`,
  `manualFiltering`, `manualPagination`). It only records what the user chose
  and passes it to `queryFn`.
- A new search, sort, page or page size = a new fetch.
- Changing the search or sort jumps back to **page 1** (otherwise you could be
  left on a page that no longer exists, e.g. page 5 of a 1-page result).
- While a new page/search loads, the **old rows stay visible but faded**
  (`keepPreviousData`), and the search icon spins.
- Results are cached for **30 seconds** (`staleTime`), so going back to a page
  you've just seen is instant.
- Selected rows are kept in a "cart" with their full data, so ticking rows on
  page 1 and page 3 and then exporting gives you **all** of them.

### What both hooks return

```ts
const { table, query } = useClientTable(...) // or useServerTable(...)
```

| Value                | Type             | Meaning                                                        |
| -------------------- | ---------------- | -------------------------------------------------------------- |
| `table`              | TanStack `Table` | The table instance. Pass it to `Table.Root`.                   |
| `query.items`        | `TData[]`        | Rows currently matching (after search). Used for empty states. |
| `query.isLoading`    | `boolean`        | First load, nothing to show yet → skeleton.                    |
| `query.isFetching`   | `boolean`        | Any fetch in progress (always `false` for the client hook).    |
| `query.error`        | `Error \| null`  | Set when loading failed.                                       |
| `query.selectedRows` | `TData[]`        | Full objects of every ticked row.                              |

You can also use `query.selectedRows` yourself, e.g. for a "Delete selected" button.

---

## Components

Everything must sit **inside** `<Table.Root>`. Using a component outside it throws
a clear error (`Table.Search must be used within Table.Root`).

| Component                              | Props                           | What it shows                                                                                                                        |
| -------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Table.Root`                           | `table`, `query`, `className?`  | The card frame. Shares `{ table, query }` with everything inside.                                                                    |
| `Table.Toolbar`                        | `children`                      | The bar above the table. Puts its children on one row, spread to both sides.                                                         |
| `Table.Search`                         | —                               | Search box. Waits 400 ms after the last keystroke before searching. Spins while fetching.                                            |
| `Table.BulkActions`                    | —                               | **Export N to CSV** and **Clear selection** buttons. Hidden when nothing is ticked.                                                  |
| `Table.ColumnVisibility`               | —                               | **Columns** menu with a checkbox per column. Closes on outside click or Esc.                                                         |
| `Table.Content`                        | `className?`                    | The table itself, plus loading / error / no data / no results states. Pass a `max-h-*` class to make it scroll with a sticky header. |
| `Table.Footer`                         | `children`                      | The bar below the table. Hidden when there's only one page **and** nothing is ticked.                                                |
| `Table.SelectedCount`                  | —                               | "3 row(s) selected". Hidden when nothing is ticked.                                                                                  |
| `Table.PageSize`                       | —                               | "Rows per page" dropdown (10 / 20 / 50). Hidden on a 1-page table.                                                                   |
| `Table.Pagination`                     | —                               | `« ‹ 1 2 3 4 5 … 20 › »`. Hidden on a 1-page table.                                                                                  |
| `Table.createSelectionColumn<TData>()` | — (a function, not a component) | Returns a checkbox column. Put it **first** in your `columns`. It can't be sorted or hidden.                                         |

You choose the layout: leave out any piece you don't need, or move it around.

### What `Table.Content` shows, in order

1. `query.isLoading` → grey skeleton rows
2. `query.error` → "Something went wrong" + the error message
3. no rows **and** a search is active → "No results found"
4. no rows → "No data yet"
5. otherwise → the rows

---

## Column recipes

```tsx
const columnHelper = createColumnHelper<Product>()

// Plain value: shows row.title as text
columnHelper.accessor('title', { header: 'Title' })

// Custom display: the VALUE stays 1200 (used for sorting and CSV), only the look changes
columnHelper.accessor('price', {
  header: 'Price',
  cell: (info) => `$${info.getValue().toFixed(2)}`,
})

// A column with no data behind it (buttons, links…)
columnHelper.display({
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => <a href={`/products/${row.original.id}`}>View</a>,
})
```

Things that depend on how you write a column:

| If the column…                        | then…                                                              |
| ------------------------------------- | ------------------------------------------------------------------ |
| is made with `accessor(...)`          | it can be sorted, searched, and is included in CSV export.         |
| is made with `display(...)`           | it can't be sorted and is **left out** of CSV export.              |
| has a plain-text `header` (`'Price'`) | that text is used in the Columns menu and as the CSV column title. |
| has a JSX/function `header`           | the column **id** is used instead in those two places.             |
| is hidden by the user                 | it's also left out of the CSV export.                              |

To stop a column from being sorted or hidden: `enableSorting: false` / `enableHiding: false`.

---

## Rules (things that break if you forget them)

1. **Every row needs a unique `id`.** Selection is stored by id. Duplicate ids
   mean ticking one row ticks all rows with that id. Rows without an `id` won't
   type-check.
2. **Define `columns` outside the component** (or wrap them in `useMemo`). A new
   array on every render makes the table rebuild its columns on every keystroke.
3. **Pass both `table` and `query` to `Table.Root`.** Forgetting `query` gives
   `Cannot read properties of undefined (reading 'isLoading')`.
4. **`Table.Content` scrolls only if you give it a height**, e.g.
   `className="max-h-[480px]"`. Without one, the table grows with its rows.
5. **The React Compiler is turned off in this project** (see `vite.config.ts`).
   TanStack Table keeps the same `table` object between renders, which the
   compiler mistakes for "nothing changed", so the table stops updating. If the
   compiler is ever turned back on, add `'use no memo'` at the top of
   `table.tsx`, both hooks, and every page component that creates a table.

---

## Files

| File                            | What's in it                                                           |
| ------------------------------- | ---------------------------------------------------------------------- |
| `table.tsx`                     | All the `Table.*` components and `createSelectionColumn`.              |
| `index.ts`                      | Exports them under short names (`Table.Root`, `Table.Search`, …).      |
| `get-page-items.ts`             | Decides which page numbers and `…` the pagination shows (max 7 slots). |
| `export-csv.ts`                 | Turns selected rows into CSV text and downloads it.                    |
| `src/hooks/use-client-table.ts` | `useClientTable` and the shared `TableQuery` type.                     |
| `src/hooks/use-server-table.ts` | `useServerTable`, `ServerTableParams` and `ServerTableResponse`.       |

## Not built yet

Ideas if you need them later:

- Pagination for the client table (`getPaginationRowModel()`).
- `initialColumnVisibility` for the client table.
- Keeping search / sort / page in the URL, so refresh or a shared link keeps your place.
- Custom bulk actions (e.g. "Delete selected"), passed in as a prop to `Table.BulkActions`.
- Starting with rows already ticked.
