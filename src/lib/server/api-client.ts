import { SESSION_COOKIE } from '#/api/auth/login'
import { refreshSessionTokens } from '#/api/auth/refresh-token'
import { HttpClient } from '#/lib/http-client/http-client'
import { HTTP_UNAUTHORIZED } from '#/lib/http-client/status-code'
import { getApiBaseUrl } from '#/lib/server/api-base-url'
import { getSessionStore } from '#/lib/storage'

import { remember } from '@epic-web/remember'
import { getCookie } from '@tanstack/react-start/server'
import axios from 'axios'

export const apiClient = remember('apiClient', () => {
  const client = new HttpClient({
    baseUrl: getApiBaseUrl(),
    logRequests: true,
  })

  client.onRequest(async (config) => {
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

    const sessionId = getCookie(SESSION_COOKIE)

    if (sessionId) {
      const session = await getSessionStore().get(sessionId)

      if (session) {
        config.headers.set('Authorization', `Bearer ${session.accessToken}`)
      }
    }

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

    async (error) => {
      if (
        !axios.isAxiosError(error) ||
        !error.config ||
        error.response?.status !== HTTP_UNAUTHORIZED
      ) {
        throw error
      }

      console.log(
        '#######################  ERROR RESPONSE START  ############################ \n\n',
        {
          method: error.config.method,
          url: `${error.config.url ?? ''}`,
          status: error.response.status,
          response: error.response.data,
        },
        '#######################  ERROR RESPONSE END  ############################ \n\n',
      )

      const originalRequest = error.config

      if (originalRequest._retry) throw error

      originalRequest._retry = true

      const tokens = await refreshSessionTokens()
      originalRequest.headers.set(
        'Authorization',
        `Bearer ${tokens.accessToken}`,
      )
      return client.resend(originalRequest)
    },
  )

  return client
})

// ------- Module augmentation ----------

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}
