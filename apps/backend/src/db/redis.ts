// redis.ts
import { createClient } from 'redis';
import { RunLog } from '../utils/types';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

await redisClient.connect();

export async function cacheRun(log: RunLog): Promise<void> {
  try {
    const key = `runlog:${log.timestamp!.toISOString()}`;
    await redisClient.set(key, JSON.stringify(log), {
      EX: 3600, // expire in 1 hour
    });

    // Add the key to a sorted set with timestamp as score
    await redisClient.zAdd('recent_runlogs', {
      score: log.timestamp!.getTime(),
      value: key,
    });

  
    const totalCount = await redisClient.zCard('recent_runlogs');
    if (totalCount > 10) {
      await redisClient.zRemRangeByRank('recent_runlogs', 0, totalCount - 11); // It will store upto 10 user requests
    }
  } catch (err) {
    console.error('Failed to cache run log in Redis:', err);
  }
}
