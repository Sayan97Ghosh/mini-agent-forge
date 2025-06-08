import { createClient } from "redis";
import crypto from "crypto";
import { RunLog } from "../utils/types";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

function getRedisKey(userId:string, tool: string, prompt: string): string {
  const hash = crypto.createHash("sha256").update(prompt).digest("hex");
  return `runlog:${userId}:${tool}:${hash}`;
}

export async function getCachedRun(
  userId: string,
  tool: string,
  prompt: string
): Promise<RunLog | null> {
  const key = getRedisKey(userId, tool, prompt);
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheRun(log: RunLog): Promise<void> {
  try {
    const key = getRedisKey(log.userId, log.tool, log.prompt);
    await redisClient.set(key, JSON.stringify(log), { EX: 60 * 60 * 12 }); // expires after 12 hours

    const userZSet = `recent_runlogs:${log.userId}`; // scoped with user uniq id
    await redisClient.zAdd(userZSet, {
      score: log.timestamp!.getTime(),
      value: key,
    });

    const totalCount = await redisClient.zCard(userZSet);
    if (totalCount > 10) {
      await redisClient.zRemRangeByRank(userZSet, 0, totalCount - 11);
    }
  } catch (err) {
    console.error("Failed to cache run log in Redis:", err);
  }
}
