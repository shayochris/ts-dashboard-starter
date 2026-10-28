import { FieldErrors } from '#/components/form-controls/field-errors'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useFieldContext } from '#/hooks/use-app-form'

function toInputValue(date: Date | undefined) {
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

type DateFieldProps = {
  label?: string
  minDate?: Date
  maxDate?: Date
}

export function DateField({ label, minDate, maxDate }: DateFieldProps) {
  const field = useFieldContext<Date>()
  return (
    <>
      {label && <Label>{label}</Label>}
      <Input
        type="date"
        min={minDate ? toInputValue(minDate) : undefined}
        max={maxDate ? toInputValue(maxDate) : undefined}
        value={toInputValue(field.state.value)}
        onChange={(e) => field.handleChange(new Date(e.target.value))}
        onBlur={field.handleBlur}
      />
      <FieldErrors />
    </>
  )
}
