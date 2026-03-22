import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET() {
  try {
    const { data: brands } = await adminSupabase
      .from("brands").select("*").order("name")

    const { data: products } = await adminSupabase
      .from("products").select("id,brand,trust_score,is_published")

    const brandsWithStats = (brands || []).map(brand => {
      const bp = (products || []).filter(p => p.brand?.toLowerCase() === brand.name?.toLowerCase())
      const published = bp.filter(p => p.is_published)
      const avgScore = bp.length > 0 ? Math.round(bp.reduce((a, c) => a + c.trust_score, 0) / bp.length) : 0
      const grade = avgScore >= 90 ? "A+" : avgScore >= 80 ? "A" : avgScore >= 70 ? "B+" : avgScore >= 60 ? "B" : avgScore >= 50 ? "C" : "D"
      return { ...brand, productCount: bp.length, publishedCount: published.length, avgScore, grade }
    })

    return NextResponse.json({ brands: brandsWithStats })
  } catch (err) {
    return NextResponse.json({ brands: [], error: err.message })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const { data, error } = await adminSupabase
      .from("brands")
      .insert([{
        name: body.name,
        slug,
        logo_url: body.logo_url || null,
        website_url: body.website_url || null,
        shop_url: body.shop_url || null,
        description: body.description || null,
        certification_date: body.certification_date || null,
        certification_type: body.certification_type || "standard",
        is_gold_partner: body.is_gold_partner || false,
        is_active: body.is_active !== false,
        contact_email: body.contact_email || null,
      }])
      .select()
    if (error) throw error
    return NextResponse.json({ success: true, brand: data[0] })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const { error } = await adminSupabase.from("brands").update(updateData).eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()
    const { error } = await adminSupabase.from("brands").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}