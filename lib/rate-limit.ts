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

export async function проверкаЛимита(ключ: string) {
  if (!лимитер) {
    return { success: true };
  }
  try {
    return await лимитер.limit(ключ);
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { success: true };
  }
}
