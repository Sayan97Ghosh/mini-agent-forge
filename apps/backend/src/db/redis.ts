import { createClient } from "redis";
import crypto from "crypto";
import { RunLog } from "../utils/types";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

function getRedisKey(tool: string, prompt: string): string {
  const hash = crypto.createHash("sha256").update(prompt).digest("hex");
  return `runlog:${tool}:${hash}`;
}

export async function getCachedRun(
  tool: string,
  prompt: string
): Promise<RunLog | null> {
  const key = getRedisKey(tool, prompt);
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheRun(log: RunLog): Promise<void> {
  try {
    const key = getRedisKey(log.tool, log.prompt);
    await redisClient.set(key, JSON.stringify(log), { EX: 3600 }); // expires after 1 hour

    await redisClient.zAdd("recent_runlogs", {
      score: log.timestamp!.getTime(),
      value: key,
    });

    const totalCount = await redisClient.zCard("recent_runlogs");
    if (totalCount > 10) {
      await redisClient.zRemRangeByRank("recent_runlogs", 0, totalCount - 11);
    }
  } catch (err) {
    console.error("Failed to cache run log in Redis:", err);
  }
}
