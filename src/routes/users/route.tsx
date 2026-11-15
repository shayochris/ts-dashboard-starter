import { apiClient } from '#/lib/server/api-client'
import { getValidatedApiResponse } from '#/utils/get-validated-response'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getUsersFn = createServerFn().handler(async () => {
  return getValidatedApiResponse({
    apiFn: apiClient.get('/users'),
    schema: z.any(),
  })
})

function useGetUsers() {
  const getUsers = useServerFn(getUsersFn)

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  return {
    users: data,
  }
}

export const Route = createFileRoute('/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const { users } = useGetUsers()

  console.log('users: ', users)
  return <div>Hello "/users"!</div>
}
