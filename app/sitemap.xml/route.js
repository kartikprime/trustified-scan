import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trustifiedscan.in"

  const { data: products } = await supabase
    .from("products")
    .select("id,updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const { data: brands } = await supabase
    .from("brands")
    .select("slug")
    .eq("is_active", true)

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/search", priority: "0.9", changefreq: "daily" },
    { url: "/scan", priority: "0.8", changefreq: "weekly" },
    { url: "/rankings", priority: "0.8", changefreq: "daily" },
    { url: "/brands", priority: "0.7", changefreq: "weekly" },
    { url: "/compare", priority: "0.7", changefreq: "weekly" },
    { url: "/ingredients", priority: "0.6", changefreq: "weekly" },
    { url: "/request", priority: "0.5", changefreq: "monthly" },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("")}
${(products || []).map(p => `
  <url>
    <loc>${baseUrl}/product/${p.id}</loc>
    <lastmod>${new Date(p.updated_at || Date.now()).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
${(brands || []).filter(b => b.slug).map(b => `
  <url>
    <loc>${baseUrl}/brands/${b.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join("")}
</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  })
}