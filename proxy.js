import { NextResponse } from "next/server"
import { LRUCache } from "lru-cache"

const rateLimiters = {
  public: new LRUCache({ max: 500, ttl: 60 * 1000 }),
  admin: new LRUCache({ max: 100, ttl: 60 * 1000 }),
  ai: new LRUCache({ max: 200, ttl: 60 * 1000 }),
}

const limits = { public: 60, admin: 100, ai: 5 }

function rateLimit(ip, type) {
  const limiter = rateLimiters[type] || rateLimiters.public
  const limit = limits[type] || 60
  const key = type + ":" + ip
  const current = (limiter.get(key) || 0) + 1
  limiter.set(key, current)
  return current <= limit
}

function getIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "*"

export function proxy(request) {
  const { pathname, method } = request.nextUrl
  const ip = getIP(request)

  // ===== HANDLE CORS PREFLIGHT =====
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // ===== RATE LIMITING =====
  if (pathname.startsWith("/api/admin/analyze") || pathname.startsWith("/api/admin/detect-category")) {
    if (!rateLimit(ip, "ai")) {
      return NextResponse.json({ error: "Too many AI requests. Wait 1 minute." }, { status: 429 })
    }
  } else if (pathname.startsWith("/api/admin")) {
    if (!rateLimit(ip, "admin")) {
      return NextResponse.json({ error: "Too many admin requests. Wait 1 minute." }, { status: 429 })
    }
  } else if (pathname.startsWith("/api")) {
    if (!rateLimit(ip, "public")) {
      return NextResponse.json({ error: "Too many requests. Wait 1 minute." }, { status: 429 })
    }
  }

  // ===== ADMIN AUTH CHECK =====
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const token = request.headers.get("x-admin-token")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized — No token" }, { status: 401 })
    }
    const masterPassword = process.env.ADMIN_MASTER_PASSWORD
    const validToken = "tru_" + Buffer.from(masterPassword + "_trustified").toString("base64")
    if (token !== validToken) {
      return NextResponse.json({ error: "Unauthorized — Invalid token" }, { status: 401 })
    }
  }

  // ===== ADD CORS HEADERS TO ALL API RESPONSES =====
  const response = NextResponse.next()
  if (pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-token")
  }

  return response
}

export const config = {
  matcher: ["/api/:path*"]
}