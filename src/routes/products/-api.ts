import type {
  ServerTableParams,
  ServerTableResponse,
} from '#/hooks/use-server-table'

export type Product = { id: number; title: string; price: number }

// 50 made-up products: "Laptop 1", "Mouse 2", "Keyboard 3", …
const names = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones']
const allProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `${names[i % 5]} ${i + 1}`,
  price: ((i * 37) % 500) + 10,
}))

export async function fetchProducts(
  params: ServerTableParams,
): Promise<ServerTableResponse<Product>> {
  console.log('🛰️ server received:', params) // watch this in the browser console

  await new Promise((resolve) => setTimeout(resolve, 600)) // pretend network delay

  if (params.q === 'error') throw new Error('The server exploded 💥') // lets you test the error screen

  let rows = allProducts

  // SERVER-SIDE SEARCH
  if (params.q) {
    const q = params.q.toLowerCase()
    rows = rows.filter((p) => p.title.toLowerCase().includes(q))
  }

  // SERVER-SIDE SORT. `sort` looks like "price,desc"
  if (params.sort) {
    const [key, direction] = params.sort.split(',') as [
      keyof Product,
      'asc' | 'desc',
    ]
    rows = [...rows].sort((a, b) => {
      const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0
      return direction === 'desc' ? -result : result
    })
  }

  const page = params.page ?? 1  // which page they asked for (1 = first). Default: first page
  const size = params.size ?? 10 // rows per page. Default: 10

  // How many pages exist? 23 rows ÷ 10 per page = 2.3 → round UP → 3 pages.
  // Math.max(1, …) so "no results" is still "1 page", not "0 pages"
  const totalPages = Math.max(1, Math.ceil(rows.length / size))

  // Cut out just this page. Page 2 with size 10 → rows 10 to 19
  const start = (page - 1) * size
  const pageRows = rows.slice(start, start + size)

  return {
    data: pageRows,
    pagination: { currentPage: page, totalPages },
  }
}
