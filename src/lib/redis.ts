import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = Boolean(url && token);

const redis = isRedisConfigured ? new Redis({ url: url!, token: token! }) : null;

/**
 * Fetch a value from cache, or compute it via `fetcher` and cache it with a TTL.
 * Never throws — any Redis failure (or Redis being unconfigured) transparently
 * falls back to calling `fetcher()` directly, so callers behave identically
 * whether or not Upstash env vars are populated.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch {
    // Redis read failed — fall through to direct fetch below.
  }

  const fresh = await fetcher();

  try {
    // Fire-and-forget: don't let a slow/failed cache write block the response.
    void redis.set(key, fresh, { ex: ttlSeconds });
  } catch {
    // Ignore cache write failures.
  }

  return fresh;
}

export { isRedisConfigured };