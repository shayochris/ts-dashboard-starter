import { useFieldContext } from '#/hooks/use-app-form'

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return undefined
}

export function FieldErrors() {
  const field = useFieldContext<unknown>()
  const message = getErrorMessage(field.state.meta.errors[0])

  if (field.state.meta.isValid || !message) return null

  return <span className="text-xs text-red-500">{message}</span>
}
