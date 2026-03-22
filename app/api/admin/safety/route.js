import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { data, error } = await adminSupabase
      .from("safety_parameters")
      .insert([{
        product_id: body.product_id,
        parameter_name: body.parameter_name,
        result: body.result || null,
        status: body.status || "safe",
        safe_limit: body.safe_limit || null,
        details: body.details || null,
      }])
      .select()
    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}