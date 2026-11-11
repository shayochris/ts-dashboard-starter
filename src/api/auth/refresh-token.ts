import { authTokensSchema, SESSION_COOKIE } from '#/api/auth/login'
import type { AuthResponse } from '#/api/auth/login'
import { HttpClient } from '#/lib'
import { getApiBaseUrl } from '#/lib/server/api-base-url'
import { getSessionStore } from '#/lib/storage'
import { validateData } from '#/utils/validate-data'
import { remember } from '@epic-web/remember'
import { getCookie } from '@tanstack/react-start/server'

export async function refreshSessionTokens(): Promise<AuthResponse> {
  const sessionId = getCookie(SESSION_COOKIE)

  if (!sessionId) {
    throw new Error('Session is not available in the cookie')
  }

  const store = getSessionStore()

  const session = await store.get(sessionId)

  if (!session) {
    throw new Error('There is no available session')
  }

  const [apiError, apiResponse] = await authClient.post('/auth/refresh-token', {
    refreshToken: session.refreshToken,
  })

  if (apiError) {
    await store.delete(session.id)
    throw new Error(apiError.message)
  }

  const [validationError, tokens] = validateData(apiResponse, authTokensSchema)

  if (validationError) {
    throw new Error(validationError.message)
  }

  await store.update(session.id, tokens)

  return tokens
}

const authClient = remember(
  'authClient',
  () =>
    new HttpClient({
      baseUrl: getApiBaseUrl(),
    }),
)
