import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase
      .from("products")
      .select("id,name,brand,category,trust_score,product_image_url,affiliate_link,price,discounted_price,short_description,is_gold_certified")
      .eq("is_published", true)
      .eq("is_gold_certified", true)
      .order("trust_score", { ascending: false })
      .limit(8)
    return NextResponse.json({ products: data || [] })
  } catch {
    return NextResponse.json({ products: [] })
  }
}