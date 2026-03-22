import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function generateProductCode() {
  try {
    const { data } = await adminSupabase
      .from("products")
      .select("product_code")
      .not("product_code", "is", null)
      .order("product_code", { ascending: false })
      .limit(1)
    if (!data || data.length === 0) return "TRU-1001"
    const num = parseInt(data[0].product_code.replace("TRU-", ""))
    return "TRU-" + (num + 1)
  } catch {
    return "TRU-" + (1001 + Math.floor(Math.random() * 100))
  }
}

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ products: data || [] })
  } catch {
    return NextResponse.json({ products: [] })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const productCode = await generateProductCode()
    const { data, error } = await adminSupabase
      .from("products")
      .insert([{
        name: body.name,
        brand: body.brand,
        category: body.category,
        barcode: body.barcode || null,
        test_date: body.test_date || null,
        trust_score: parseInt(body.trust_score) || 0,
        lab_report_url: body.lab_report_url || null,
        affiliate_link: body.affiliate_link || null,
        amazon_link: body.amazon_link || null,
        flipkart_link: body.flipkart_link || null,
        product_image_url: body.product_image_url || null,
        price: body.price || null,
        discounted_price: body.discounted_price || null,
        is_gold_certified: body.is_gold_certified || false,
        is_featured: body.is_featured || false,
        short_description: body.short_description || null,
        offer_text: body.offer_text || null,
        youtube_url: body.youtube_url || null,
        batch_number: body.batch_number || null,
        expiry_date: body.expiry_date || null,
        testing_status: body.testing_status || "passed",
        verification_status: body.verification_status || "verified",
        is_published: false,
        product_code: productCode,
      }])
      .select()
    if (error) throw error
    return NextResponse.json({ success: true, product: data[0] })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}