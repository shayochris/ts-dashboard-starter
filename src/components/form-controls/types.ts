import type { SelectField } from '#/components/form-controls/select-field'
import type { TextAreaField } from '#/components/form-controls/text-area-field'
import type { TextField } from '#/components/form-controls/text-field'
import type {
  DeepKeys,
  DeepValue,
  FieldAsyncValidateOrFn,
  FieldListeners,
  FieldValidateOrFn,
  FieldValidators,
} from '@tanstack/react-form'
import type { ComponentProps } from 'react'

export type InputTypes = 'text' | 'textarea' | 'select'

export type FieldPropsMap = {
  text: ComponentProps<typeof TextField>
  textarea: ComponentProps<typeof TextAreaField>
  select: ComponentProps<typeof SelectField>
}

export type InputConfig = {
  [TInput in InputTypes]: { inputType: TInput } & FieldPropsMap[TInput]
}[InputTypes]

type SyncValidator<TFormData, TName extends DeepKeys<TFormData>> =
  undefined | FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>

// same, but async
type AsyncValidator<TFormData, TName extends DeepKeys<TFormData>> =
  | undefined
  | FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>

export type FieldConfigValidators<
  TFormData,
  TName extends DeepKeys<TFormData>,
> = FieldValidators<
  TFormData,
  TName,
  DeepValue<TFormData, TName>,
  SyncValidator<TFormData, TName>, // onMount
  SyncValidator<TFormData, TName>, // onChange
  AsyncValidator<TFormData, TName>, // onChangeAsync
  SyncValidator<TFormData, TName>, // onBlur
  AsyncValidator<TFormData, TName>, // onBlurAsync
  SyncValidator<TFormData, TName>, // onSubmit
  AsyncValidator<TFormData, TName>, // onSubmitAsync
  SyncValidator<TFormData, TName>, // onDynamic
  AsyncValidator<TFormData, TName> // onDynamicAsync
>

export type FieldConfig<
  TFormData,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
> = {
  name: TName
  hidden?: boolean | ((formData: TFormData) => boolean)
  listeners?: FieldListeners<TFormData, TName>
  validators?: FieldConfigValidators<TFormData, TName>
} & InputConfig

export type FormField<TFormData> = {
  [TName in DeepKeys<TFormData>]: FieldConfig<TFormData, TName>
}[DeepKeys<TFormData>]
