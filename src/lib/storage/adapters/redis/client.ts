import Redis from 'ioredis'

let client: Redis | undefined

export function getRedisClient() {
  if (!client) {
    client = new Redis({
      host: 'localhost',
      port: 6379,
    })

    client.on('error', (error) => console.error('Redis client error', error))
  }

  return client
}
