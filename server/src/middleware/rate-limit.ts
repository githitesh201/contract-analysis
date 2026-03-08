import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

type Bucket = {
  count: number;
  resetAt: number;
};

export const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
}: RateLimitOptions) => {
  const buckets = new Map<string, Bucket>();
  let lastCleanup = Date.now();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}:${req.path}`;
    const existing = buckets.get(key);

    if (now - lastCleanup > windowMs || buckets.size > 5000) {
      for (const [bucketKey, bucket] of buckets.entries()) {
        if (bucket.resetAt < now) {
          buckets.delete(bucketKey);
        }
      }
      lastCleanup = now;
    }

    if (!existing || existing.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      next();
      return;
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.status(429).json({ error: message });
      return;
    }

    existing.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - existing.count)));
    buckets.set(key, existing);
    next();
  };
};
