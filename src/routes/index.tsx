import { RenderFormField } from '#/components/form-controls/render-form-field'
import { Button } from '#/components/ui/button'
import { useManageUserForm } from '#/routes/-form-manager'
import type { UserFormType } from '#/routes/-form-manager'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const onSubmit = (values: UserFormType) => {
    console.log('values', values)
  }

  const { form, fields } = useManageUserForm({ onSubmit })

  return (
    <div className="p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        {fields.map((field) => (
          <RenderFormField key={field.name} form={form} field={field} />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}
