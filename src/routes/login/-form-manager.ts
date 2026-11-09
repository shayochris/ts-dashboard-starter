// schema

import type { FormField } from '#/components/form-controls/types'
import { useAppForm } from '#/hooks/use-app-form'
import type { UseManageFormProps } from '#/routes/-form-manager'
import z from 'zod'

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export type LoginFormType = z.infer<typeof loginFormSchema>

const defaultValues = {
  email: '',
  password: '',
}

export function useManageLoginForm({
  onSubmit,
}: UseManageFormProps<LoginFormType>) {
  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
    validators: {
      onChange: loginFormSchema,
    },
  })

  const fields: FormField<LoginFormType>[] = [
    {
      name: 'email',
      inputType: 'text',
      label: 'Username',
      placeholder: 'Enter your email',
    },
    {
      name: 'password',
      inputType: 'text',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
    },
  ]

  return {
    fields,
    form,
  }
}
