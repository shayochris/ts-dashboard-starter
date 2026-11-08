import { randomUUID } from 'node:crypto'

import { getRedisClient } from '#/lib/storage/adapters/redis/client'
import type {
  CreateSessionInput,
  SessionRecord,
  SessionStore,
} from '#/lib/storage/session-store'

function getSessionKey(id: string) {
  return `session:${id}`
}

export function createRedisSessionStore(): SessionStore {
  const redis = getRedisClient()

  return {
    create: async (input: CreateSessionInput): Promise<SessionRecord> => {
      const now = Date.now()
      const record: SessionRecord = {
        id: randomUUID(),
        expiresAt: input.expiresAt,
        createdAt: now,
        userId: input.userId,
      }

      const ttlSeconds = Math.max(1, Math.ceil((record.expiresAt - now) / 1000))

      await redis.set(
        getSessionKey(record.id),
        JSON.stringify(record),
        'EX',
        ttlSeconds,
      )

      return record
    },
    delete: async (id: string) => {
      await redis.del(getSessionKey(id))
    },
    get: async (id: string): Promise<SessionRecord | null> => {
      const raw = await redis.get(getSessionKey(id))
      if (!raw) return null
      return JSON.parse(raw)
    },
  }
}
