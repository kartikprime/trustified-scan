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
      .from("composition_results")
      .insert([{
        product_id: body.product_id,
        parameter_name: body.parameter_name,
        label_claim: body.label_claim || null,
        lab_result: body.lab_result,
        status: body.status || "accurate",
        loq: body.loq || null,
        unit: body.unit || null,
        parameter_type: body.parameter_type || "general",
      }])
      .select()
    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}