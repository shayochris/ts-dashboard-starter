import { Label } from '#/components/ui/label'
import { useFieldContext } from '#/hooks/use-app-form'

type SelectFieldProps = {
  label?: string
  options: { label: string; value: string }[]
}

export function SelectField({ label, options }: SelectFieldProps) {
  const field = useFieldContext<string>()
  return (
    <>
      {label && <Label>{label}</Label>}
      <select
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
