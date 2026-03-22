import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"
    const sort = searchParams.get("sort") || "score_desc"
    const minScore = parseInt(searchParams.get("minScore") || "0")
    const maxScore = parseInt(searchParams.get("maxScore") || "100")

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    let query = supabase
      .from("products")
      .select("id,name,brand,category,trust_score,test_date,youtube_url")
      .eq("is_published", true)
      .gte("trust_score", minScore)
      .lte("trust_score", maxScore)

    if (category !== "all") query = query.eq("category", category)

    if (sort === "score_desc") query = query.order("trust_score", { ascending: false })
    else if (sort === "score_asc") query = query.order("trust_score", { ascending: true })
    else if (sort === "newest") query = query.order("test_date", { ascending: false })
    else if (sort === "oldest") query = query.order("test_date", { ascending: true })

    const { data } = await query.limit(50)
    return NextResponse.json({ products: data || [] })
  } catch {
    return NextResponse.json({ products: [] })
  }
}