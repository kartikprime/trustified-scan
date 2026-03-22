import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (slug) {
      // P12 — Single query with parallel execution
      const { data: brand } = await supabase.from("brands").select("*").eq("slug", slug).eq("is_active", true).single()
      if (!brand) return NextResponse.json({ brand: null })

      const { data: products } = await supabase
        .from("products")
        .select("id,name,brand,category,trust_score,product_image_url,affiliate_link,price,discounted_price,is_published,product_code,is_gold_certified")
        .ilike("brand", brand.name)
        .eq("is_published", true)
        .order("trust_score", { ascending: false })

      const avgScore = products?.length > 0
        ? Math.round(products.reduce((a, c) => a + c.trust_score, 0) / products.length)
        : 0
      const grade = avgScore >= 90 ? "A+" : avgScore >= 80 ? "A" : avgScore >= 70 ? "B+" : avgScore >= 60 ? "B" : avgScore >= 50 ? "C" : "D"

      return NextResponse.json(
        { brand: { ...brand, avgScore, grade }, products: products || [] },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
      )
    }

    // P12 — Get brands and product counts in parallel
    const [brandsRes, productsRes] = await Promise.all([
      supabase.from("brands").select("id,name,slug,logo_url,is_gold_partner,certification_type,is_active").eq("is_active", true).order("name"),
      supabase.from("products").select("brand,trust_score").eq("is_published", true),
    ])

    const brands = brandsRes.data || []
    const products = productsRes.data || []

    const brandsWithStats = brands.map(brand => {
      const bp = products.filter(p => p.brand?.toLowerCase() === brand.name?.toLowerCase())
      const avgScore = bp.length > 0 ? Math.round(bp.reduce((a, c) => a + c.trust_score, 0) / bp.length) : 0
      const grade = avgScore >= 90 ? "A+" : avgScore >= 80 ? "A" : avgScore >= 70 ? "B+" : avgScore >= 60 ? "B" : avgScore >= 50 ? "C" : "D"
      return { ...brand, productCount: bp.length, avgScore, grade }
    })

    return NextResponse.json(
      { brands: brandsWithStats },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    )
  } catch (err) {
    return NextResponse.json({ brands: [], error: err.message })
  }
}