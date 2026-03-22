import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET() {
  try {
    const { data: products } = await adminSupabase
      .from("products")
      .select("id,name,brand,category,trust_score,is_published,is_gold_certified,affiliate_link,product_image_url,youtube_url,product_code,created_at,short_description")
      .order("created_at", { ascending: false })

    const { data: brands } = await adminSupabase
      .from("brands").select("id,name,is_active")

    const { data: composition } = await adminSupabase
      .from("composition_results").select("product_id")

    const { data: safety } = await adminSupabase
      .from("safety_parameters").select("product_id")

    const allProducts = products || []
    const compMap = {}
    const safetyMap = {}
    ;(composition || []).forEach(c => { compMap[c.product_id] = (compMap[c.product_id] || 0) + 1 })
    ;(safety || []).forEach(s => { safetyMap[s.product_id] = (safetyMap[s.product_id] || 0) + 1 })

    const pendingActions = []
    const noImage = allProducts.filter(p => !p.product_image_url)
    const noBuyLink = allProducts.filter(p => !p.affiliate_link)
    const noYoutube = allProducts.filter(p => !p.youtube_url)
    const noDescription = allProducts.filter(p => !p.short_description)
    const noComposition = allProducts.filter(p => !compMap[p.id] || compMap[p.id] === 0)
    const noSafety = allProducts.filter(p => !safetyMap[p.id] || safetyMap[p.id] === 0)
    const drafts = allProducts.filter(p => !p.is_published)

    if (drafts.length > 0) pendingActions.push({ type: "warning", message: drafts.length + " products in draft — waiting for review", count: drafts.length })
    if (noComposition.length > 0) pendingActions.push({ type: "error", message: noComposition.length + " products have no composition data", count: noComposition.length })
    if (noSafety.length > 0) pendingActions.push({ type: "error", message: noSafety.length + " products have no safety parameters", count: noSafety.length })
    if (noImage.length > 0) pendingActions.push({ type: "warning", message: noImage.length + " products missing product image", count: noImage.length })
    if (noBuyLink.length > 0) pendingActions.push({ type: "warning", message: noBuyLink.length + " products missing buy link", count: noBuyLink.length })
    if (noYoutube.length > 0) pendingActions.push({ type: "info", message: noYoutube.length + " products missing YouTube link", count: noYoutube.length })
    if (noDescription.length > 0) pendingActions.push({ type: "info", message: noDescription.length + " products missing short description", count: noDescription.length })

    const productsWithStats = allProducts.map(p => ({
      ...p,
      compositionCount: compMap[p.id] || 0,
      safetyCount: safetyMap[p.id] || 0,
      completeness: Math.round(
        ([!!p.product_image_url, !!p.affiliate_link, !!p.short_description, !!p.youtube_url, (compMap[p.id] || 0) > 0, (safetyMap[p.id] || 0) > 0, p.trust_score > 0].filter(Boolean).length / 7) * 100
      )
    }))

    return NextResponse.json({
      stats: {
        total: allProducts.length,
        live: allProducts.filter(p => p.is_published).length,
        draft: allProducts.filter(p => !p.is_published).length,
        gold: allProducts.filter(p => p.is_gold_certified).length,
        brands: (brands || []).length,
        activeBrands: (brands || []).filter(b => b.is_active).length,
        totalComposition: composition?.length || 0,
        totalSafety: safety?.length || 0,
      },
      pendingActions,
      recentProducts: productsWithStats.slice(0, 5),
      allProducts: productsWithStats,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message })
  }
}