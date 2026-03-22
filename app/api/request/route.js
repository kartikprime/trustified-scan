import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.product_name || body.product_name.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Product name too short" })
    }
    if (body.product_name.length > 100) {
      return NextResponse.json({ success: false, error: "Product name too long" })
    }

    const productName = body.product_name.trim()
    const brand = body.brand?.trim() || null

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `Is "${productName}" by "${brand || "unknown"}" a real Indian health supplement or food product? Reply with only YES or NO.` }],
        temperature: 0.1,
        max_tokens: 10,
      })
    })

    const aiData = await groqRes.json()
    const aiText = aiData.choices?.[0]?.message?.content || ""

    if (aiText.toUpperCase().includes("NO")) {
      return NextResponse.json({ success: false, error: "This does not appear to be a valid Indian supplement product." })
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    const { error } = await supabase
      .from("product_requests")
      .insert([{ product_name: productName, brand, requested_by_ip: ip }])

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." })
  }
}

export async function GET() {
  try {
    const { data } = await supabase
      .from("product_requests")
      .select("product_name,brand,created_at")
      .order("created_at", { ascending: false })
      .limit(20)
    return NextResponse.json({ requests: data || [] })
  } catch {
    return NextResponse.json({ requests: [] })
  }
}