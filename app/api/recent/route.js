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
      .select("id,name,brand,category,trust_score,test_date,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(8)
    return NextResponse.json({ products: data || [] })
  } catch {
    return NextResponse.json({ products: [] })
  }
}