// ===== UUID VALIDATION =====
export function isValidUUID(str) {
  if (!str) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

// ===== INPUT SANITIZATION =====
export function sanitizeText(str, maxLength = 200) {
  if (!str) return null
  return str
    .toString()
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"]/g, "")
}

export function sanitizeNumber(val, min = 0, max = 100) {
  const num = parseInt(val)
  if (isNaN(num)) return null
  return Math.min(max, Math.max(min, num))
}

export function sanitizePrice(val) {
  const num = parseFloat(val)
  if (isNaN(num) || num < 0) return null
  return Math.round(num * 100) / 100
}

// ===== GOOGLE DRIVE URL VALIDATION =====
export function isValidDriveURL(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    // Only allow Google Drive domains
    const allowedHosts = ["drive.google.com", "docs.google.com"]
    if (!allowedHosts.includes(parsed.hostname)) return false
    // Must contain a file ID pattern
    const hasFileId = /[-\w]{25,}/.test(url)
    return hasFileId
  } catch {
    return false
  }
}

export function extractDriveFileId(url) {
  if (!isValidDriveURL(url)) return null
  const match = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/)
  if (match) return match[1]
  const match2 = url.match(/id=([a-zA-Z0-9_-]{25,})/)
  if (match2) return match2[1]
  return null
}

// ===== URL VALIDATION =====
export function isValidURL(url) {
  if (!url) return true // optional fields
  try {
    const parsed = new URL(url)
    return ["http:", "https:"].includes(parsed.protocol)
  } catch {
    return false
  }
}

// ===== CORS HEADERS =====
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
  }
}