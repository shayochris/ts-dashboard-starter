import { getSessionStore } from '#/lib/storage'

console.log('adapter:', process.env.STORAGE_ADAPTER ?? 'memory')

const store = getSessionStore()

const session = await store.create({
  userId: 'user-1',
  expiresAt: Date.now() + 60_000,
})
console.log('created:', session)
console.log('fetched:', await store.get(session.id))

await store.delete(session.id)
console.log('after delete:', await store.get(session.id))

// an open Redis connection keeps Node running, so exit explicitly
process.exit(0)
