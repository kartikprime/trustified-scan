import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { isValidUUID } from "@/lib/security"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { ids } = await request.json()
    if (!ids || ids.length < 2) return NextResponse.json({ error: "Need at least 2 products" })

    for (const id of ids) {
      if (!isValidUUID(id)) return NextResponse.json({ error: "Invalid product ID" })
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const [productRes, compRes, safetyRes] = await Promise.all([
          supabase.from("products").select("*").eq("id", id).eq("is_published", true).single(),
          supabase.from("composition_results").select("*").eq("product_id", id),
          supabase.from("safety_parameters").select("*").eq("product_id", id),
        ])
        return {
          product: productRes.data,
          composition: compRes.data || [],
          safety: safetyRes.data || [],
        }
      })
    )

    const validResults = results.filter(r => r.product !== null)
    if (validResults.length < 2) return NextResponse.json({ error: "One or more products not found" })

    const prompt = `Compare these ${validResults.length} Indian health supplement products and give a brief safety comparison in 2-3 sentences. Which is safer and why?
${validResults.map(r => `${r.product?.name} by ${r.product?.brand}: Trust Score ${r.product?.trust_score}/100`).join(", ")}
Return ONLY the comparison text, no JSON.`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      })
    })

    const aiData = await groqRes.json()
    const aiSummary = aiData.choices?.[0]?.message?.content?.trim() || ""

    return NextResponse.json({ products: validResults, aiSummary })
  } catch (err) {
    return NextResponse.json({ error: err.message })
  }
}