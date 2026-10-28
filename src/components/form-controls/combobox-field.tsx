import { FieldErrors } from '#/components/form-controls/field-errors'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '#/components/ui/combobox'
import { Label } from '#/components/ui/label'
import { useFieldContext } from '#/hooks/use-app-form'

type Option = { label: string; value: string }

type ComboboxFieldProps = {
  label?: string
  placeholder?: string
  emptyMessage?: string
  options: Option[]
}

export function ComboboxField({
  label,
  placeholder,
  emptyMessage = 'No results found',
  options,
}: ComboboxFieldProps) {
  const field = useFieldContext<string>()
  const selected =
    options.find((option) => option.value === field.state.value) ?? null
  return (
    <>
      {label && <Label>{label}</Label>}
      <Combobox
        items={options}
        value={selected}
        onValueChange={(option) => field.handleChange(option?.value ?? '')}
      >
        <ComboboxInput
          className="w-full"
          placeholder={placeholder ?? 'Search…'}
          onBlur={field.handleBlur}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(option: Option) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldErrors />
    </>
  )
}
