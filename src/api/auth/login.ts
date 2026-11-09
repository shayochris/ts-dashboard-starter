import { apiClient } from '#/lib/server/api-client'
import { loginFormSchema } from '#/routes/login/-form-manager'
import type { LoginFormType } from '#/routes/login/-form-manager'
import { validateData } from '#/utils/validate-data'
import { useMutation } from '@tanstack/react-query'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import z from 'zod'
import { decodeJwt } from 'jose'
import { getSessionStore } from '#/lib/storage'
import { setCookie, getCookie } from '@tanstack/react-start/server'
import { toast } from '#/components/ui/toast'
import { useNavigate } from '@tanstack/react-router'

export const SESSION_COOKIE = 'session_id'
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

const accessTokenPayloadSchema = z.object({
  sub: z.string(),
})

export const loginFn = createServerFn({ method: 'POST' })
  .validator(loginFormSchema)
  .handler(async ({ data }) => {
    const [apiError, apiResponse] = await apiClient.post('/auth/login', {
      ...data,
    })

    if (apiError) {
      throw new Error(apiError.message)
    }

    const [validationError, validatedResponse] = validateData(
      apiResponse,
      authTokensSchema,
    )

    if (validationError) {
      throw new Error(validationError.message)
    }

    const [decodingError, decodedToken] = validateData(
      decodeJwt(validatedResponse.accessToken),
      accessTokenPayloadSchema,
    )

    if (decodingError) {
      throw new Error(decodingError.message)
    }

    const { sub: userId } = decodedToken

    const session = await getSessionStore().create({
      userId,
      accessToken: validatedResponse.accessToken,
      refreshToken: validatedResponse.refreshToken,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    })

    setCookie(SESSION_COOKIE, session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    })
  })

export function useLoginUser() {
  const login = useServerFn(loginFn)
  const navigate = useNavigate()

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: async (input: LoginFormType) => {
      await login({ data: { ...input } })
    },
    onError: (error) => {
      toast.add({
        type: 'error',
        description: error.message,
      })
    },
    onSuccess: () => {
      navigate({ to: '/dashboard' })
    },
  })

  return {
    loginUser: mutateAsync,
    isLoggingUserIn: isPending,
  }
}

export const getLoggedInUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sessionId = getCookie(SESSION_COOKIE)

    if (!sessionId) return null

    const sessionData = await getSessionStore().get(sessionId)

    if (!sessionData) return null

    return sessionData.userId
  },
)
