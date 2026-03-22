import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { isValidUUID } from "@/lib/security"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    const { id } = params

    // S8 — Validate UUID before DB query
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: composition } = await supabase
      .from("composition_results")
      .select("*")
      .eq("product_id", id)
      .order("parameter_type", { ascending: true })
      .order("created_at", { ascending: true })

    const { data: safety } = await supabase
      .from("safety_parameters")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: true })

    const { data: similar } = await supabase
      .from("products")
      .select("id,name,brand,trust_score,product_image_url,category,discounted_price,affiliate_link,product_code,is_gold_certified")
      .eq("is_published", true)
      .eq("category", product.category)
      .neq("id", id)
      .order("trust_score", { ascending: false })
      .limit(4)

    return NextResponse.json({
      product,
      composition: composition || [],
      safety: safety || [],
      similar: similar || [],
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}