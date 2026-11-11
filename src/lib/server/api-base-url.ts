import type { BaseUrl } from '#/lib/http-client/http-client'

const isBaseUrl = (value: string): value is BaseUrl => {
  return value.startsWith('http://') || value.startsWith('https://')
}

export const getApiBaseUrl = (): BaseUrl => {
  const url = process.env.API_BASE_URL

  if (!url) {
    throw new Error('API Base Url is not configured')
  }

  if (!isBaseUrl(url)) {
    throw new Error('Invalid API Base Url')
  }

  return url
}
