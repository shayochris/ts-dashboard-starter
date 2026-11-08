/**
 * what a stored session looks like
 */
export type SessionRecord = {
  id: string
  userId: string
  createdAt: number
  expiresAt: number
}

/**
 * arguments  app provides while creating a session
 */
export type CreateSessionInput = {
  userId: string
  expiresAt: number
}

/**
 * The shape every session adapter must fit
 */
export type SessionStore = {
  create: (input: CreateSessionInput) => Promise<SessionRecord>
  get: (id: string) => Promise<SessionRecord | null>
  delete: (id: string) => Promise<void>
}
