import { FieldErrors } from '#/components/form-controls/field-errors'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { useFieldContext } from '#/hooks/use-app-form'

type TextAreaFieldProps = {
  label?: string
  placeholder?: string
  rows?: number
}

export function TextAreaField({
  label,
  placeholder,
  rows,
}: TextAreaFieldProps) {
  const field = useFieldContext<string>()
  return (
    <>
      {label && <Label>{label}</Label>}
      <Textarea
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        rows={rows}
      />
      <FieldErrors />
    </>
  )
}
