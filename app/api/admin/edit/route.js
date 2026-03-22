import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, id, data } = body
    let error
    if (type === "product") {
      ({ error } = await adminSupabase.from("products").update(data).eq("id", id))
    } else if (type === "composition") {
      ({ error } = await adminSupabase.from("composition_results").update(data).eq("id", id))
    } else if (type === "safety") {
      ({ error } = await adminSupabase.from("safety_parameters").update(data).eq("id", id))
    }
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}