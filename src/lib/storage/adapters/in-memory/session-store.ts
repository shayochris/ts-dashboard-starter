import type {
  CreateSessionInput,
  SessionRecord,
  SessionStore,
} from '#/lib/storage/session-store'
import { randomUUID } from 'node:crypto'

export function createInMemorySessionStore(): SessionStore {
  const sessions = new Map<string, SessionRecord>()

  return {
    create: async (input: CreateSessionInput) => {
      const now = Date.now()

      const record: SessionRecord = {
        id: randomUUID(),
        createdAt: now,
        expiresAt: input.expiresAt,
        userId: input.userId,
      }
      sessions.set(record.id, record)
      return record
    },
    get: async (id: string): Promise<SessionRecord | null> => {
      const record = sessions.get(id)

      if (!record) return null

      if (record.expiresAt < Date.now()) {
        sessions.delete(id)
        return null
      }
      return record
    },
    delete: async (id: string): Promise<void> => {
      sessions.delete(id)
    },
  }
}
