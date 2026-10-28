import type { FormField } from '#/components/form-controls/types'
import { useAppForm } from '#/hooks/use-app-form'
import z from 'zod'
import { startOfToday, subYears } from 'date-fns'

const userFormSchema = z.object({
  password: z
    .string()
    .min(5, { message: 'Password must contain at least 5 characters' }),
  confirmPassword: z.string(),
  bio: z.string(),
  age: z.number(),
  country: z.string(),
  birthday: z.date(),
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
  birthday: new Date(),
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
      type: 'password',
      inputType: 'text',
      name: 'password',
      label: 'Password',
      placeholder: 'Enter password',
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
      validators: {
        onChange: ({ value, fieldApi }) => {
          return value !== fieldApi.form.getFieldValue('password')
            ? { message: 'mismatch' }
            : undefined
        },
      },
    },
    {
      inputType: 'textarea',
      name: 'bio',
      label: 'Biography',
      placeholder: 'Enter your biography',
      rows: 10,
    },
    {
      clearable: true,
      inputType: 'select',
      name: 'country',
      label: 'country',
      options: [
        { label: 'Tanzania', value: 'Tanzania' },
        { label: 'kenya', value: 'kenya' },
      ],
    },
    {
      inputType: 'date',
      name: 'birthday',
      label: 'birthday',
      maxDate: subYears(startOfToday(), 18),
    },
  ]

  return {
    form,
    fields,
  }
}
