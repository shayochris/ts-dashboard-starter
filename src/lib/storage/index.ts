import { SESSION_COOKIE } from '#/api/auth/login'
import { createInMemorySessionStore } from '#/lib/storage/adapters/in-memory/session-store'
import { createRedisSessionStore } from '#/lib/storage/adapters/redis/session-store'
import type { SessionRecord, SessionStore } from '#/lib/storage/session-store'
import { remember } from '@epic-web/remember'
import { getCookie } from '@tanstack/react-start/server'

type StorageAdapter = 'memory' | 'redis'

function readAdapterName(): StorageAdapter {
  const value = process.env.STORAGE_ADAPTER ?? 'memory'

  if (value !== 'memory' && value !== 'redis') {
    throw new Error(
      `Unknown storage adapter ${value}, use "memory" or "redis" `,
    )
  }

  return value
}

function createSessionStore(adapter: StorageAdapter): SessionStore {
  switch (adapter) {
    case 'redis':
      return createRedisSessionStore()

    case 'memory':
      return createInMemorySessionStore()
  }
}

export function getSessionStore(): SessionStore {
  return remember('storage:session-store', () =>
    createSessionStore(readAdapterName()),
  )
}

export async function loadSession(): Promise<SessionRecord | null> {
  const sessionId = getCookie(SESSION_COOKIE)

  if (!sessionId) return null

  const session = await getSessionStore().get(sessionId)

  if (!session) return null

  return session
}
