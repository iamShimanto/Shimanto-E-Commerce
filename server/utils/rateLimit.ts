import type { Request, Response, NextFunction, RequestHandler } from "express";
import redis from "../Config/redis";

type RateLimitOptions = {
  limit: number;
  windowSec: number;
  keyPrefix?: string;
  keyGenerator?: (req: Request) => string;
  message?: string;
  statusCode?: number;
  setHeaders?: boolean;
};

const LUA_FIXED_WINDOW = `
local key = KEYS[1]
local window = tonumber(ARGV[1])

local count = redis.call("INCR", key)
if count == 1 then
  redis.call("EXPIRE", key, window)
end

local ttl = redis.call("TTL", key)
return { count, ttl }
`;

function getClientIp(req: Request): string {
  const xf = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim();
  return xf || req.ip || (req.socket.remoteAddress ?? "unknown");
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const {
    limit,
    windowSec,
    keyPrefix = "rl",
    keyGenerator,
    message = "Too many requests. Please try again later.",
    statusCode = 429,
    setHeaders = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = keyGenerator ? keyGenerator(req) : getClientIp(req);
      const routePart = req.baseUrl + req.path;
      const key = `${keyPrefix}:${routePart}:${id}`;

      const result = (await redis.eval(
        LUA_FIXED_WINDOW,
        1,
        key,
        windowSec.toString(),
      )) as [number, number];

      const count = result[0];
      const ttl = result[1] < 0 ? windowSec : result[1];

      const remaining = Math.max(0, limit - count);

      if (setHeaders) {
        res.setHeader("X-RateLimit-Limit", String(limit));
        res.setHeader("X-RateLimit-Remaining", String(remaining));
        res.setHeader(
          "X-RateLimit-Reset",
          String(Math.floor(Date.now() / 1000) + ttl),
        );
        res.setHeader("Retry-After", String(ttl));
      }

      if (count > limit) {
        return res.status(statusCode).json({
          success: false,
          message,
          retryAfterSec: ttl,
        });
      }

      return next();
    } catch (err) {
      console.error("rateLimit error:", err);
      return next();
    }
  };
}
