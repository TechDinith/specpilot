import { createNeonAuth } from "@neon/auth/next/server";

// Lazily create the Neon Auth instance so the app still builds/boots when env
// vars are not yet configured (e.g. CI without secrets). Runtime calls will
// throw a clear error if the vars are missing.
let cached: ReturnType<typeof createNeonAuth> | null = null;

function getAuth() {
  if (cached) return cached;
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) {
    throw new Error(
      "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET in .env.local",
    );
  }
  cached = createNeonAuth({ baseUrl, cookies: { secret } });
  return cached;
}

export const auth = new Proxy({} as ReturnType<typeof createNeonAuth>, {
  get(_target, prop) {
    const instance = getAuth();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});