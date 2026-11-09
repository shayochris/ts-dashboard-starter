import { useLoginUser } from '#/api/auth/login'
import { RenderFormField } from '#/components/form-controls/render-form-field'
import { Button } from '#/components/ui/button'
import { useManageLoginForm } from '#/routes/login/-form-manager'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { loginUser, isLoggingUserIn } = useLoginUser()

  const { fields, form } = useManageLoginForm({
    onSubmit: async (values) => await loginUser(values),
  })

  return (
    <div className="p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        {fields.map((field) => (
          <RenderFormField key={field.name} field={field} form={form} />
        ))}

        <Button disabled={isLoggingUserIn} type="submit">
          Submit
        </Button>
      </form>
    </div>
  )
}
