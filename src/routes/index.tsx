import { apiClient } from '#/lib/server/api-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const getTodosFn = createServerFn().handler(async () => {
  const [apiError, response] = await apiClient.get<Todo[]>('/todo')

  if (apiError) {
    throw new Error(apiError.message)
  }

  return response
})

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const getTodos = useServerFn(getTodosFn)

  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
  })

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
