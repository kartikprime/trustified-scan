import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"
    const sort = searchParams.get("sort") || "featured"

    let query = supabase
      .from("products")
      .select("id,name,brand,category,trust_score,product_image_url,affiliate_link,amazon_link,flipkart_link,price,discounted_price,short_description,is_gold_certified,product_code,offer_text,is_featured")
      .eq("is_published", true)
      .or("affiliate_link.not.is.null,amazon_link.not.is.null,flipkart_link.not.is.null")

    if (category !== "all") query = query.eq("category", category)

    if (sort === "featured") query = query.order("is_featured", { ascending: false }).order("trust_score", { ascending: false })
    else if (sort === "price_low") query = query.order("discounted_price", { ascending: true })
    else if (sort === "price_high") query = query.order("discounted_price", { ascending: false })
    else if (sort === "score") query = query.order("trust_score", { ascending: false })

    const { data, error } = await query.limit(60)
    if (error) throw error

    return NextResponse.json(
      { products: data || [] },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
    )
  } catch (err) {
    return NextResponse.json({ products: [], error: err.message })
  }
}