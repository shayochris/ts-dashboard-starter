import type { ErrorType, TryCatchReturnType } from '#/lib'
import { validateData } from '#/utils/validate-data'
import type { ZodType } from 'zod'

type ApiResultType = TryCatchReturnType<unknown, ErrorType>

type GetValidatedApiResponseProps<TSchema extends ZodType> = {
  apiFn: (() => Promise<ApiResultType>) | Promise<ApiResultType>
  schema: TSchema
}

export async function getValidatedApiResponse<TSchema extends ZodType>({
  apiFn,
  schema,
}: GetValidatedApiResponseProps<TSchema>): Promise<TSchema['_output']> {
  const [apiError, apiResponse] =
    typeof apiFn === 'function' ? await apiFn() : await apiFn

  if (apiError) {
    throw new Error(apiError.message)
  }

  const [validationError, validatedResponse] = validateData(apiResponse, schema)

  if (validationError) {
    throw new Error(validationError.message)
  }

  return validatedResponse
}
