import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const лимитер = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, "1 h"),
      analytics: true,
    })
  : null;

// In-memory fallback for environments without Redis
interface MemoryEntry {
  count: number;
  reset: number; // timestamp in seconds
}

const memoryStore = new Map<string, MemoryEntry>();

async function memoryLimit(key: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  const windowSec = 60 * 60; // 1 hour
  const limit = 3;

  const entry = memoryStore.get(key);
  if (!entry || now > entry.reset) {
    // New window
    const resetTime = now + windowSec;
    memoryStore.set(key, { count: 1, reset: resetTime });
    return { success: true, limit, remaining: limit - 1, reset: resetTime };
  }

  if (entry.count < limit) {
    entry.count += 1;
    return { success: true, limit, remaining: limit - entry.count, reset: entry.reset };
  }

  return { success: false, limit, remaining: 0, reset: entry.reset };
}

export async function проверкаЛимита(ключ: string) {
  if (лимитер) {
    try {
      return await лимитер.limit(ключ);
    } catch (error) {
      console.error("Rate limit check failed:", error);
      // Fallback to memory on Redis error
      return await memoryLimit(ключ);
    }
  }
  // Use in-memory limiter when Redis not configured
  return await memoryLimit(ключ);
}
