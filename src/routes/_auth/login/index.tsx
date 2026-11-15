import { useLoginUser } from '#/api/auth/login'
import { RenderFormField } from '#/components/form-controls/render-form-field'
import { Button } from '#/components/ui/button'
import { useManageLoginForm } from '#/routes/_auth/login/-form-manager'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { loginUser, isLoggingUserIn } = useLoginUser()

  const { fields, form } = useManageLoginForm({
    onSubmit: async (values) => await loginUser(values),
  })

  return (
    <>
      <header className="mb-8">
        <h1 className="text-lg font-medium tracking-tight">Sign in</h1>
        <p className="text-sm">to access your dashboard</p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-3"
      >
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <RenderFormField field={field} form={form} />
          </div>
        ))}

        <Button
          disabled={isLoggingUserIn}
          type="submit"
          className="mt-3 w-full rounded-sm font-semibold"
        >
          {isLoggingUserIn ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </>
  )
}
