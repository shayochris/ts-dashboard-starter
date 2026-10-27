import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import type { AppFieldExtendedReactFormApi } from '@tanstack/react-form'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})

export type AppForm<TFormData = any> = AppFieldExtendedReactFormApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any, // the form's validator types
  any, // submit meta
  any, // field components
  NonNullable<unknown>
>
