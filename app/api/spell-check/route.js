import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const query = body.query
    if (!query) return NextResponse.json({ suggestion: null })

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `Fix spelling of this Indian supplement or brand name if wrong, return only the corrected name, nothing else: "${query}"` }],
        temperature: 0.1,
        max_tokens: 50,
      })
    })

    const data = await groqRes.json()
    const suggestion = data.choices?.[0]?.message?.content?.trim() || null
    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ suggestion: null })
  }
}