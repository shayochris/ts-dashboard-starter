import { SESSION_COOKIE } from '#/api/auth/login'
import { toast } from '#/components/ui/toast'
import { HttpClient } from '#/lib'
import type { BaseUrl } from '#/lib'
import { getSessionStore, loadSession } from '#/lib/storage'
import { useMutation } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { deleteCookie } from '@tanstack/react-start/server'

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await loadSession()

  if (session) {
    const apiClient = new HttpClient({
      baseUrl: process.env.API_BASE_URL as BaseUrl,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    const [logoutError] = await apiClient.post('/auth/logout', null)

    if (logoutError) {
      console.error(logoutError)
    }

    await getSessionStore().delete(session.id)
  }

  deleteCookie(SESSION_COOKIE, { path: '/' })

  throw redirect({ to: '/login' })
})

export function useLogoutUser() {
  const logout = useServerFn(logoutFn)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => logout(),
    mutationKey: ['logout'],
    onError: (error) => {
      toast.add({
        type: 'error',
        description: error.message,
      })
    },
  })

  return {
    logout: mutateAsync,
    isLoggingOut: isPending,
  }
}
