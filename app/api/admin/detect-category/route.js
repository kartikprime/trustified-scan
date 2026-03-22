import { NextResponse } from "next/server"
import { sanitizeText } from "@/lib/security"

const VALID_CATEGORIES = ["whey_protein","whey_isolate","plant_protein","casein_protein","creatine","pre_workout","bcaa","glutamine","mass_gainer","multivitamin","omega3","vitamin_c","vitamin_d","zinc","magnesium","shilajit","ashwagandha","protein_bar","nut_butter","dark_chocolate","fat_burner","l_carnitine","other_supplement"]

export async function POST(request) {
  try {
    const body = await request.json()
    const productName = sanitizeText(body.productName, 150)
    const brandName = sanitizeText(body.brandName, 100)

    if (!productName || !brandName) {
      return NextResponse.json({ success: false, error: "Invalid input" })
    }

    const prompt = `What category is this Indian supplement: "${productName}" by "${brandName}"?
Choose ONLY one from this list: ${VALID_CATEGORIES.join(", ")}
Reply with ONLY the category value, nothing else.`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 20,
      })
    })

    const data = await groqRes.json()
    const raw = data.choices?.[0]?.message?.content?.trim().toLowerCase() || ""
    const detected = VALID_CATEGORIES.find(cat => raw.includes(cat)) || "other_supplement"

    return NextResponse.json({ success: true, category: detected })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}