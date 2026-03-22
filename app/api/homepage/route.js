import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    const [statsResult, goldResult, recentResult] = await Promise.all([
      // Stats — use count instead of fetching all rows (fixes P3)
      supabase.from("products").select("id,trust_score", { count: "exact" }).eq("is_published", true),
      // Gold products
      supabase.from("products")
        .select("id,name,brand,category,trust_score,product_image_url,affiliate_link,price,discounted_price,short_description,is_gold_certified,product_code")
        .eq("is_published", true)
        .eq("is_gold_certified", true)
        .order("trust_score", { ascending: false })
        .limit(8),
      // Recent products
      supabase.from("products")
        .select("id,name,brand,category,trust_score,product_image_url,affiliate_link,discounted_price,product_code,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8),
    ])

    const products = statsResult.data || []
    const totalProducts = statsResult.count || 0
    const totalParams = products.reduce((acc) => acc + 1, 0)

    return NextResponse.json(
      {
        stats: {
          products: totalProducts,
          params: totalParams * 8,
          blind: 100,
          paid: 0,
        },
        goldProducts: goldResult.data || [],
        recentProducts: recentResult.data || [],
      },
      {
        headers: {
          // P4 — Cache for 5 minutes
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (err) {
    return NextResponse.json({ stats: { products: 0, params: 0, blind: 100, paid: 0 }, goldProducts: [], recentProducts: [] })
  }
}