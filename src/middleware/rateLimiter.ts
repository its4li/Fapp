import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";
import { AppError } from "./errorHandler";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

export function rateLimiter(options: RateLimitOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const key = `ratelimit:${options.keyPrefix}:${userId}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;

    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, now, `${now}:${Math.random().toString(36).slice(2)}`);
    multi.zcard(key);
    multi.pexpire(key, options.windowMs);

    const results = await multi.exec();
    if (!results) {
      throw new AppError(500, "Rate limiter unavailable");
    }

    const count = results[2][1] as number;
    if (count > options.max) {
      throw new AppError(429, "Rate limit exceeded");
    }

    next();
  };
}
