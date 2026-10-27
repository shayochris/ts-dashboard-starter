import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useFieldContext } from '#/hooks/use-app-form'

type TextFieldProps = {
  label?: string
  placeholder?: string
}

export function TextField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<string>()
  return (
    <>
      {label && <Label>{label}</Label>}
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
      />
      {!field.state.meta.isValid && (
        <span className="text-xs text-red-500">
          {field.state.meta.errors[0]?.message}
        </span>
      )}
    </>
  )
}
