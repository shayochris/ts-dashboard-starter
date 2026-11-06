import { HttpClient } from '#/lib/http-client/http-client'
import type { BaseUrl } from '#/lib/http-client/http-client'

import { remember } from '@epic-web/remember'

interface AxiosErrorType {
  config?: { baseURL?: string; method?: string; url?: string }
  response?: { data?: unknown; status?: number }
}

function isAxiosLikeError(error: unknown): error is AxiosErrorType {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error
}

const isBaseUrl = (value: string): value is BaseUrl => {
  return value.startsWith('http://') || value.startsWith('https://')
}

const getApiBaseUrl = (): BaseUrl => {
  const url = process.env.API_BASE_URL

  if (!url) {
    throw new Error('API Base Url is not configured')
  }

  if (!isBaseUrl(url)) {
    throw new Error('Invalid API Base Url')
  }

  return url
}

export const apiClient = remember('apiClient', () => {
  const client = new HttpClient({
    baseUrl: getApiBaseUrl(),
    logRequests: true,
  })

  client.onRequest((config) => {
    console.log(
      '#######################  REQUEST START  ############################ \n\n',
      {
        method: config.method,
        payload:
          config.method?.toUpperCase() === 'POST' ? config.data : undefined,
        url: `${config.baseURL ?? ''}${config.url ?? ''}`,
      },
      '#######################  REQUEST END  ############################ \n\n',
    )
    return config
  })

  client.onResponse(
    (response) => {
      console.log(
        '#######################  RESPONSE START  ############################ \n\n',
        response.data,
        '#######################  RESPONSE END  ############################ \n\n',
      )
      return response
    },

    (error) => {
      if (isAxiosLikeError(error)) {
        console.log(
          '#######################  ERROR RESPONSE START  ############################ \n\n',
          {
            method: error.config?.method,
            url: `${error.config?.url ?? ''}`,
            status: error.response?.status,
            response: error.response?.data,
          },
          '#######################  ERROR RESPONSE END  ############################ \n\n',
        )
      }
      throw error
    },
  )

  return client
})
