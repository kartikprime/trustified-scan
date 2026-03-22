import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get("brand")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    if (brand) {
      const { data } = await supabase
        .from("products")
        .select("id,name,brand,category,trust_score,test_date")
        .eq("is_published", true)
        .ilike("brand", "%" + brand + "%")
        .order("trust_score", { ascending: false })
      return NextResponse.json({ products: data || [] })
    }

    const { data } = await supabase
      .from("products")
      .select("brand,trust_score")
      .eq("is_published", true)

    const brandMap = {}
    data?.forEach(p => {
      if (!brandMap[p.brand]) brandMap[p.brand] = { brand: p.brand, scores: [], count: 0 }
      brandMap[p.brand].scores.push(p.trust_score)
      brandMap[p.brand].count++
    })

    const brands = Object.values(brandMap).map(b => ({
      brand: b.brand,
      count: b.count,
      avgScore: Math.round(b.scores.reduce((a, c) => a + c, 0) / b.scores.length),
    })).sort((a, b) => b.avgScore - a.avgScore)

    return NextResponse.json({ brands })
  } catch {
    return NextResponse.json({ brands: [], products: [] })
  }
}