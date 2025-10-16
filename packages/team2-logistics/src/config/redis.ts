import Redis from 'redis';
import { logger } from '@/utils/logger';

export let redisClient: Redis.RedisClientType;

export async function setupRedis(): Promise<void> {
  try {
    redisClient = Redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

export default redisClient;