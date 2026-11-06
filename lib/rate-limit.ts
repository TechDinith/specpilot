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

// Per-user / per-IP daily cap. Uses DB when available, falls back to in-memory.
const DAILY_CAP = 10;
const daily = new Map<string, { count: number; day: string }>();

export async function checkDailyCap(key: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);

  // Try DB first.
  try {
    const { db } = await import("@/lib/db");
    if (db) {
      const { usage } = await import("@/lib/db/schema");
      const { eq, and } = await import("drizzle-orm");
      const rows = await db
        .select()
        .from(usage)
        .where(and(eq(usage.userId, key), eq(usage.day, day)))
        .limit(1);

      const current = rows[0]?.count ?? 0;
      if (current >= DAILY_CAP) return false;

      if (rows[0]) {
        await db
          .update(usage)
          .set({ count: current + 1 })
          .where(and(eq(usage.userId, key), eq(usage.day, day)));
      } else {
        await db.insert(usage).values({ userId: key, day, count: 1 });
      }
      return true;
    }
  } catch {
    // Fall through to in-memory.
  }

  // In-memory fallback.
  const entry = daily.get(key);
  if (!entry || entry.day !== day) {
    daily.set(key, { count: 1, day });
    return true;
  }
  if (entry.count >= DAILY_CAP) return false;
  entry.count += 1;
  return true;
}