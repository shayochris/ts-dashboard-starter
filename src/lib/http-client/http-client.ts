import { tryCatchHttp } from '#/lib/http-client/try-catch-http'
import type { ErrorType } from '#/lib/http-client/try-catch-http'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  Method as HttpMethod,
  AxiosResponse,
} from 'axios'
import axios from 'axios'

export type BaseUrl = `https://${string}` | `http://${string}`
export type Endpoint = `/${string}` | `${BaseUrl}/${string}`

type OnRequestFulfilled<TBody = unknown> = (
  config: InternalAxiosRequestConfig<TBody>,
) =>
  InternalAxiosRequestConfig<TBody> | Promise<InternalAxiosRequestConfig<TBody>>

type OnRequestRejected = (error: unknown) => never

export interface ExtendedAxiosInstance extends AxiosInstance {
  defaults: AxiosInstance['defaults'] & { logRequests?: boolean }
}

export interface HttpRequestConfig<TBody = unknown> extends Omit<
  AxiosRequestConfig<TBody>,
  'baseURL' | 'method' | 'url'
> {
  baseUrl: BaseUrl
  logRequests?: boolean
}

export type HttpMethodRequestConfig<TBody = unknown> = Partial<
  Omit<HttpRequestConfig<TBody>, 'logRequests'>
>

interface RequestConfig<
  TBody = unknown,
> extends HttpMethodRequestConfig<TBody> {
  endpoint: Endpoint
  method: HttpMethod
}

type RequestInterceptorOptions = {
  runWhen?: (config: InternalAxiosRequestConfig) => boolean
  synchronous?: boolean
}

export class HttpClient {
  #globalConfig: HttpRequestConfig
  #axios: AxiosInstance

  constructor(config: HttpRequestConfig) {
    this.#globalConfig = config

    const { baseUrl, ...rest } = config

    this.#axios = axios.create({
      baseURL: baseUrl,
      ...rest,
    })
  }

  onRequest(
    fullfilled: OnRequestFulfilled,
    rejected?: OnRequestRejected,
    options?: RequestInterceptorOptions,
  ) {
    const id = this.#axios.interceptors.request.use(
      fullfilled,
      rejected,
      options,
    )
    return () => this.#axios.interceptors.request.eject(id)
  }

  onResponse(
    fulfilled: (
      response: AxiosResponse,
    ) => AxiosResponse | Promise<AxiosResponse>,
    rejected?: OnRequestRejected,
  ) {
    const id = this.#axios.interceptors.response.use(fulfilled, rejected)
    return () => this.#axios.interceptors.response.eject(id)
  }

  post = async <
    TResponse,
    TBody = unknown,
    TError extends ErrorType = ErrorType,
  >(
    endpoint: Endpoint,
    body: TBody,
    config?: HttpMethodRequestConfig<TBody>,
  ) => {
    return this.#request<TResponse, TBody, TError>({
      data: body,
      endpoint,
      ...config,
      method: 'POST',
    })
  }

  delete = async <TResponse, TError extends ErrorType = ErrorType>(
    endpoint: Endpoint,
    config?: HttpMethodRequestConfig,
  ) => {
    return this.#request<TResponse, unknown, TError>({
      endpoint,
      method: 'DELETE',
      ...config,
    })
  }

  put = async <
    TResponse,
    TBody = unknown,
    TError extends ErrorType = ErrorType,
  >(
    endpoint: Endpoint,
    body: TBody,
    config?: HttpMethodRequestConfig<TBody>,
  ) => {
    return this.#request<TResponse, TBody, TError>({
      data: body,
      endpoint,
      ...config,
      method: 'PUT',
    })
  }

  patch = async <
    TResponse,
    TBody = unknown,
    TError extends ErrorType = ErrorType,
  >(
    endpoint: Endpoint,
    body: TBody,
    config?: HttpMethodRequestConfig<TBody>,
  ) => {
    return this.#request<TResponse, TBody, TError>({
      data: body,
      endpoint,
      ...config,
      method: 'PATCH',
    })
  }

  get = async <TResponse, TError extends ErrorType = ErrorType>(
    endpoint: Endpoint,
    config?: HttpMethodRequestConfig,
  ) => {
    return this.#request<TResponse, unknown, TError>({
      endpoint,
      ...config,
      method: 'GET',
    })
  }

  #logRequest = (config: AxiosRequestConfig) => {
    if (this.#globalConfig.logRequests) {
      console.log(config)
    }
  }

  #mergeConfig = <TBody = unknown>({
    baseUrl,
    endpoint,
    headers,
    method,
    ...otherConfigs
  }: RequestConfig<TBody>) => {
    const {
      baseUrl: globalBaseUrl,
      headers: globalHeaders,
      ...otherGlobalConfigs
    } = this.#globalConfig

    const effectiveBaseUrl = baseUrl ?? globalBaseUrl

    const isAbsoluteUrl =
      endpoint.startsWith('http://') || endpoint.startsWith('https://')

    return {
      ...otherGlobalConfigs,
      ...otherConfigs,
      baseURL: isAbsoluteUrl ? undefined : effectiveBaseUrl,
      headers: {
        ...globalHeaders,
        ...headers,
      },
      method,
      url: endpoint,
    } satisfies AxiosRequestConfig
  }

  async #request<
    TResponse,
    TBody = unknown,
    TError extends ErrorType = ErrorType,
  >(requestConfig: RequestConfig<TBody>) {
    this.#logRequest(requestConfig)
    const config = this.#mergeConfig<TBody>(requestConfig)
    return tryCatchHttp<TResponse, TError>(async () => {
      const response = await this.#axios.request<TResponse>(config)
      return response.data
    })()
  }
}
