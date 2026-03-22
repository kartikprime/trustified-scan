import { LRUCache } from "lru-cache"

const rateLimiters = {
  public: new LRUCache({ max: 500, ttl: 60 * 1000 }),
  admin: new LRUCache({ max: 100, ttl: 60 * 1000 }),
  ai: new LRUCache({ max: 200, ttl: 60 * 1000 }),
  scan: new LRUCache({ max: 200, ttl: 60 * 1000 }),
}

const limits = {
  public: 60,
  admin: 100,
  ai: 5,
  scan: 10,
}

export function rateLimit(ip, type = "public") {
  const limiter = rateLimiters[type] || rateLimiters.public
  const limit = limits[type] || 60
  const key = type + ":" + ip
  const current = (limiter.get(key) || 0) + 1
  limiter.set(key, current)
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    limit,
  }
}

export function getIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}