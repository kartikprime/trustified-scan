import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const category = searchParams.get("category") || "all"
    const minScore = parseInt(searchParams.get("minScore") || "0")
    const maxScore = parseInt(searchParams.get("maxScore") || "100")
    const sort = searchParams.get("sort") || "score_desc"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from("products")
      // P2 — Only select needed columns
      .select("id,name,brand,category,trust_score,test_date,product_image_url,is_gold_certified,product_code,affiliate_link,discounted_price", { count: "exact" })
      .eq("is_published", true)
      .or("name.ilike.%" + q + "%,brand.ilike.%" + q + "%")
      .gte("trust_score", minScore)
      .lte("trust_score", maxScore)

    if (category !== "all") query = query.eq("category", category)

    if (sort === "score_desc") query = query.order("trust_score", { ascending: false })
    else if (sort === "score_asc") query = query.order("trust_score", { ascending: true })
    else if (sort === "newest") query = query.order("created_at", { ascending: false })
    else query = query.order("trust_score", { ascending: false })

    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json(
      {
        products: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > to + 1,
      },
      {
        headers: {
          // P4 — Cache search for 2 minutes
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    )
  } catch {
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0, hasMore: false })
  }
}