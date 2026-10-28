import { TextAreaField } from '#/components/form-controls/text-area-field'
import { TextField } from '#/components/form-controls/text-field'
import type {
  FieldPropsMap,
  FormField,
  InputTypes,
} from '#/components/form-controls/types'
import { useSelector } from '@tanstack/react-store'
import type { AppForm } from '#/hooks/use-app-form'
import { SelectField } from '#/components/form-controls/select-field'
import type { ComponentType } from 'react'
import { DateField } from '#/components/form-controls/date-field'
import { ComboboxField } from '#/components/form-controls/combobox-field'

const FIELD_COMPONENTS: { [K in InputTypes]: ComponentType<FieldPropsMap[K]> } =
  {
    text: TextField,
    textarea: TextAreaField,
    select: SelectField,
    date: DateField,
    combobox: ComboboxField,
  }

type RenderFormFieldProps<TFormData> = {
  form: AppForm<TFormData>
  field: FormField<TFormData>
}

function renderField<T extends InputTypes>(
  inputType: T,
  props: FieldPropsMap[T],
) {
  const Component: ComponentType<FieldPropsMap[T]> = FIELD_COMPONENTS[inputType]
  return <Component {...props} />
}

export function RenderFormField<TFormData>({
  form,
  field,
}: RenderFormFieldProps<TFormData>) {
  const { inputType, name, hidden, listeners, validators, ...rest } = field

  const values = useSelector(form.store, (state) => state.values)

  const isHidden =
    typeof hidden === 'function' ? hidden(values) : Boolean(hidden)

  if (isHidden) return null

  return (
    <form.AppField
      name={name}
      listeners={listeners}
      validators={validators}
      children={() => renderField(inputType, rest)}
    />
  )
}
