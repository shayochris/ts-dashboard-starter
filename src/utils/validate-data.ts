import { tryCatch } from '#/lib/try-catch'
import type { ZodError, ZodType } from 'zod'

export function validateData<TSchema extends ZodType>(
  data: unknown,
  schema: TSchema,
) {
  return tryCatch<TSchema['_output'], ZodError<TSchema['_input']>>(() =>
    schema.parse(data),
  )
}
