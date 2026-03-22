import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const ingredient = body.ingredient

    if (!ingredient || ingredient.trim().length < 2) {
      return NextResponse.json({ error: "Please enter an ingredient name" })
    }

    const cleanIngredient = ingredient.trim().slice(0, 100)

    const prompt = `You are a health supplement expert. Explain this ingredient to Indian consumers: "${cleanIngredient}"
Return ONLY this exact JSON no extra text no markdown:
{
  "name": "${cleanIngredient}",
  "what_is_it": "simple 1-2 sentence explanation",
  "why_used": "why supplement or food companies add it",
  "health_impact": "health effects honest answer",
  "fssai_status": "FSSAI India status",
  "safety_level": "safe",
  "alternatives": "alternatives or none"
}
For safety_level use only: safe, caution, or avoid`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 800,
      })
    })

    if (!groqRes.ok) {
      const errData = await groqRes.json()
      return NextResponse.json({ error: "AI error: " + (errData?.error?.message || "Please try again") })
    }

    const data = await groqRes.json()
    const text = data.choices?.[0]?.message?.content || ""

    if (!text) {
      return NextResponse.json({ error: "AI returned empty response. Please try again." })
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response. Please try again." })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, data: parsed })

  } catch (err) {
    return NextResponse.json({ error: "Something went wrong: " + err.message })
  }
}