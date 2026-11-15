type TryCatchSuccess<TResult> = [null, TResult]
type TryCatchError<TError> = [TError, null]

export type TryCatchResult<TResult, TError = Error> =
  TryCatchSuccess<TResult> | TryCatchError<TError>

export function tryCatch<TResult, TError = Error>(
  input: Promise<TResult>,
): Promise<TryCatchResult<TResult, TError>>

export function tryCatch<TResult, TError = Error>(
  input: () => Promise<TResult>,
): Promise<TryCatchResult<TResult, TError>>

export function tryCatch<TResult, TError = Error>(
  input: TResult,
): TryCatchResult<TResult, TError>

export function tryCatch<TResult, TError = Error>(
  input: () => TResult,
): TryCatchResult<TResult, TError>

export function tryCatch<TResult, TError = Error>(
  input:
    TResult | (() => TResult) | Promise<TResult> | (() => Promise<TResult>),
): TryCatchResult<TResult, TError> | Promise<TryCatchResult<TResult, TError>> {
  const isPromise =
    input instanceof Promise ||
    (typeof input === 'function' && input.constructor.name === 'AsyncFunction')

  const handlePromise = async () => {
    try {
      const result =
        typeof input === 'function'
          ? await (input as () => Promise<TResult>)()
          : await input
      return [null, result] as [null, TResult]
    } catch (error) {
      return [error as TError, null] as [TError, null]
    }
  }

  if (isPromise) {
    return handlePromise()
  }

  try {
    const result =
      typeof input === 'function' ? (input as () => TResult)() : input
    return [null, result] as [null, TResult]
  } catch (error) {
    return [error as TError, null] as [TError, null]
  }
}
