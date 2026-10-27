import type { FormField } from '#/components/form-controls/types'
import { useAppForm } from '#/hooks/use-app-form'
import z from 'zod'

const userFormSchema = z.object({
  password: z
    .string()
    .min(5, { message: 'Password must contain at least 5 characters' }),
  confirmPassword: z.string(),
  bio: z.string(),
  age: z.number(),
  country: z.string(),
})

export type UserFormType = z.infer<typeof userFormSchema>

type UseManageUserFormProps<T extends Record<string, any>> = {
  onSubmit: (values: T) => void
}

const defaultValues = {
  password: '',
  confirmPassword: '',
  bio: '',
  age: 0,
  country: '',
}

export function useManageUserForm({
  onSubmit,
}: UseManageUserFormProps<UserFormType>) {
  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
    validators: { onChange: userFormSchema },
  })

  const fields: FormField<UserFormType>[] = [
    {
      inputType: 'text',
      name: 'password',
      label: 'Password',
      placeholder: 'Enter password',
      listeners: {
        onChange: ({ fieldApi }) => {
          fieldApi.form.setFieldValue('confirmPassword', '')
        },
      },
      validators: {
        onChange: ({ value }) => {
          console.log('value', value)
        },
      },
    },
    {
      inputType: 'text',
      name: 'confirmPassword',
      label: 'Confirm Password',
      hidden: (values) => !values.password,
    },
    {
      inputType: 'textarea',
      name: 'bio',
      label: 'Biography',
      placeholder: 'Enter your biography',
      rows: 10,
    },
    {
      inputType: 'select',
      name: 'country',
      label: 'country',
      options: [],
    },
  ]

  return {
    form,
    fields,
  }
}
