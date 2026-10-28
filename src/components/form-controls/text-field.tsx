import { FieldErrors } from '#/components/form-controls/field-errors'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Label } from '#/components/ui/label'
import { useFieldContext } from '#/hooks/use-app-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import type { ComponentPropsWithRef } from 'react'

type TextFieldProps = {
  label?: string
  placeholder?: string
} & Omit<
  ComponentPropsWithRef<'input'>,
  'name' | 'hidden' | 'onChange' | 'onBlur' | 'defaultValue' | 'value'
>

export function TextField({ label, type, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>()
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <>
      {label && <Label>{label}</Label>}
      <InputGroup>
        <InputGroupInput
          {...inputProps}
          type={inputType}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
        {isPassword && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <FieldErrors />
    </>
  )
}
