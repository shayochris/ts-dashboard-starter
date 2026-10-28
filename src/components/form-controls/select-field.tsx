import { FieldErrors } from '#/components/form-controls/field-errors'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useFieldContext } from '#/hooks/use-app-form'
import { XIcon } from 'lucide-react'

type SelectOption = { label: string; value: string }

type SelectFieldProps = {
  label?: string
  placeholder?: string
  clearable?: boolean
  options: SelectOption[]
}

export function SelectField({
  label,
  placeholder,
  clearable = false,
  options,
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const showClear = clearable && Boolean(field.state.value)

  return (
    <>
      {label && <Label>{label}</Label>}
      <div className="relative w-full">
        <Select
          items={options}
          value={field.state.value || null}
          onValueChange={(value) => field.handleChange(value ?? '')}
        >
          <SelectTrigger className="w-full" onBlur={field.handleBlur}>
            <SelectValue placeholder={placeholder ?? 'Select…'} />
            {/* reserves room for the clear button so the text doesn't run under it */}
            {showClear && <span aria-hidden className="size-6 shrink-0" />}
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {options.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground flex items-center justify-center">
                No options available
              </div>
            )}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Clear selection"
            className="absolute top-1/2 right-7.5 -translate-y-1/2"
            onClick={() => field.handleChange('')}
          >
            <XIcon />
          </Button>
        )}
      </div>
      <FieldErrors />
    </>
  )
}
