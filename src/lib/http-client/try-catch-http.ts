import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_NOT_AVAILABLE,
  NETWORK_ERROR_CODE,
} from '#/lib/http-client/status-code'
import { tryCatch } from '#/lib/try-catch'
import { checkIsDevMode } from '#/lib/utils'
import type { AxiosError } from 'axios'
import axios from 'axios'

const defaultErrorObject = {
  message: 'Unknown Error occured',
  status: HTTP_INTERNAL_SERVER_ERROR,
}

/**
 * Defines a standard shape for all api errors in the application.
 * Contains an error message and a HTTP status code
 */
export interface ErrorType {
  message: string
  status: number
}

/**
 * Represent the success operation in try-catch,
 * returns a tuple with the first element(error) null(no error) and the second element as a result data
 */
type SuccessType<TData> = [null, TData]

/**
 * Represents a failed operation in try-catch,
 * The first element is the information about the error, the second element is null (no data)
 */
type FailureType<TError extends ErrorType> = [TError, null]

/**
 * The return type of a try-catch, which can contain the data or error information
 */
export type TryCatchReturnType<TData, TError extends ErrorType> =
  SuccessType<TData> | FailureType<TError>

const isBrowserOffline = () =>
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  !navigator.onLine

const isAxiosNetworkError = (error: AxiosError) => {
  if (isBrowserOffline()) return true
  if (error.request && !error.response) return true
  const code = (error.code || '').toUpperCase()
  return Boolean(code && NETWORK_ERROR_CODE.includes(code))
}

/**
 * The helper function to check the shape of a returned api error response object
 * it accepts any object without the message or with a message containing a string
 * @param data a response returned from api error
 * @returns a boolean and types the passed argument as {message?: string} when return type is true
 */
const isServerErrorBody = (data: unknown): data is { message?: string } => {
  return (
    typeof data === 'object' &&
    data !== null &&
    (!('message' in data) || typeof data.message === 'string')
  )
}

const extractErrorInfo = async (error: unknown): Promise<ErrorType> => {
  if (checkIsDevMode()) {
    console.error(
      '[API-Error] ######################################## \n',
      error,
      ' ##################################\n',
    )
  }

  if (axios.isAxiosError(error)) {
    const rawData: unknown = error.response?.data
    const errorData = isServerErrorBody(rawData) ? rawData : undefined

    if (isAxiosNetworkError(error)) {
      return {
        message:
          'Failed to connect to server. Make sure your device is connected to internet',
        status: HTTP_SERVICE_NOT_AVAILABLE,
      }
    }

    return {
      ...errorData,
      message:
        errorData?.message || error.message || defaultErrorObject.message,
      status: Number(error.response?.status) || HTTP_INTERNAL_SERVER_ERROR,
    }
  }

  if (error instanceof Error) {
    return {
      ...defaultErrorObject,
      message: error.message,
    }
  }

  if (typeof error === 'string') {
    return { ...defaultErrorObject, message: error }
  }

  return defaultErrorObject
}

type AsyncFunc<TArgs extends unknown[], TData> = (
  ...args: TArgs
) => Promise<TData>

export const tryCatchHttp = <
  TData,
  TError extends ErrorType,
  TArgs extends unknown[] = [],
>(
  asyncFunc: AsyncFunc<TArgs, TData>,
): ((...args: TArgs) => Promise<TryCatchReturnType<TData, TError>>) => {
  return async (...args: TArgs): Promise<TryCatchReturnType<TData, TError>> => {
    const [error, response] = await tryCatch<TData>(asyncFunc(...args))

    if (error) {
      const errorInfo = await extractErrorInfo(error)
      return [errorInfo, null] as FailureType<TError>
    }

    return [null, response] as SuccessType<TData>
  }
}
