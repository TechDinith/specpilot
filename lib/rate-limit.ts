import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash (free tier) when configured; otherwise an in-memory fallback
// (per-instance, resets on cold start — fine for local dev only).

type Limiter = { limit: (id: string) => Promise<{ success: boolean; remaining: number }> };

let cached: Limiter | null = null;

function createLimiter(): Limiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min per key
      analytics: true,
      prefix: "specpilot",
    });
    return {
      limit: async (id: string) => {
        const r = await rl.limit(id);
        return { success: r.success, remaining: r.remaining };
      },
    };
  }

  // In-memory fallback.
  const store = new Map<string, { count: number; reset: number }>();
  const WINDOW_MS = 60_000;
  const MAX = 10;
  return {
    limit: async (id: string) => {
      const now = Date.now();
      const entry = store.get(id);
      if (!entry || entry.reset < now) {
        store.set(id, { count: 1, reset: now + WINDOW_MS });
        return { success: true, remaining: MAX - 1 };
      }
      if (entry.count >= MAX) {
        return { success: false, remaining: 0 };
      }
      entry.count += 1;
      return { success: true, remaining: MAX - entry.count };
    },
  };
}

export function getRateLimiter(): Limiter {
  if (!cached) cached = createLimiter();
  return cached;
}

// Per-user daily cap (in-memory; replace with DB counter in Phase 5).
const daily = new Map<string, { count: number; day: string }>();
const DAILY_CAP = 10;

export function checkDailyCap(userId: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const entry = daily.get(userId);
  if (!entry || entry.day !== day) {
    daily.set(userId, { count: 1, day });
    return true;
  }
  if (entry.count >= DAILY_CAP) return false;
  entry.count += 1;
  return true;
}