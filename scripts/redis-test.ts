import { getRedisClient } from '#/lib/storage/adapters/redis/client'

console.log('same client', getRedisClient() === getRedisClient())

await getRedisClient().set('hello', 'world')

console.log('value: ', await getRedisClient().get('hello'))

await getRedisClient().quit()
