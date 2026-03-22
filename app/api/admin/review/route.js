import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "No ID" })

    const { data: product } = await adminSupabase
      .from("products").select("*").eq("id", id).single()

    const { data: composition } = await adminSupabase
      .from("composition_results").select("*").eq("product_id", id)
      .order("parameter_type", { ascending: true })
      .order("created_at", { ascending: true })

    const { data: safety } = await adminSupabase
      .from("safety_parameters").select("*").eq("product_id", id)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      product: product || {},
      composition: composition || [],
      safety: safety || [],
    })
  } catch (err) {
    return NextResponse.json({ error: err.message })
  }
}