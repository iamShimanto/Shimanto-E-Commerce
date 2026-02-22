import redis from "../Config/redis";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function safeStringify(value: unknown): string {
  return JSON.stringify(value);
}

function safeParse<T>(value: string | null): T | null {
  if (value == null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setCache<T = unknown>(
  key: string,
  value: T,
  ttlSec: number = 3600,
): Promise<boolean> {
  try {
    const payload = safeStringify(value);

    if (ttlSec && ttlSec > 0) {
      // SET key value EX ttlSec
      await redis.set(key, payload, "EX", ttlSec);
    } else {
      await redis.set(key, payload);
    }
    return true;
  } catch (err) {
    console.error("setCache error:", err);
    return false;
  }
}

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return safeParse<T>(data);
  } catch (err) {
    console.error("getCache error:", err);
    return null;
  }
}

export async function delCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error("delCache error:", err);
    return false;
  }
}

export async function existsCache(key: string): Promise<boolean> {
  try {
    const n = await redis.exists(key);
    return n === 1;
  } catch {
    return false;
  }
}
