import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { id, is_published } = body
    const { error } = await adminSupabase
      .from("products")
      .update({
        is_published,
        published_date: is_published ? new Date().toISOString() : null
      })
      .eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}