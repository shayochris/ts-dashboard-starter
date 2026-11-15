import { getLoggedInUser } from '#/api/auth/login'
import { useLogoutUser } from '#/api/auth/logout'
import { Button } from '#/components/ui/button'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => {
    const userId = await getLoggedInUser()
    if (!userId) {
      throw redirect({ to: '/login' })
    }
    return { userId }
  },
})

function RouteComponent() {
  const { logout, isLoggingOut } = useLogoutUser()
  return (
    <div>
      Hello "/dashboard"!
      <Button onClick={() => logout()} disabled={isLoggingOut}>
        Logout
      </Button>
    </div>
  )
}
