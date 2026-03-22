import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { imageData } = await request.json()
    if (!imageData) return NextResponse.json({ success: false, error: "No image provided" })

    const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData
    const mimeType = imageData.startsWith("data:image/png") ? "image/png" : "image/jpeg"

    const prompt = `You are an expert at reading Indian packaged food product labels.
Look at this product image carefully and extract:
1. The exact product name as written on the packaging
2. The brand name as written on the packaging
3. The product category from this list: chips, namkeen, popcorn, milk, curd, paneer, butter, ghee, cheese, ice_cream, lassi, sunflower_oil, mustard_oil, coconut_oil, soft_drinks, fruit_juice, energy_drinks, packaged_water, tea, coffee, instant_noodles, pasta, bread, cake, cornflakes, oats, dal, turmeric, chili_powder, salt, ketchup, mayonnaise, chocolate_bar, candy, protein_powder, honey, other
4. Your confidence percentage (0-100) in reading the product correctly

Return ONLY this exact JSON, nothing else:
{
  "productName": "exact product name from packaging",
  "brandName": "exact brand name from packaging",
  "category": "category from the list above",
  "confidence": <number 0-100>,
  "additionalInfo": "any other relevant product info visible"
}

If you cannot clearly read the product name or brand, return:
{
  "productName": "Unknown",
  "brandName": "Unknown",
  "category": "other",
  "confidence": 0,
  "additionalInfo": "Image not clear enough to read product details"
}`

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: prompt }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
        })
      }
    )

    if (!geminiResponse.ok) return NextResponse.json({ success: false, error: "AI service error. Please try again." })

    const geminiData = await geminiResponse.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ success: false, error: "Could not read product from image. Please try a clearer photo." })

    const parsed = JSON.parse(jsonMatch[0])
    if (parsed.productName === "Unknown" || parsed.confidence < 40) {
      return NextResponse.json({ success: false, error: "Image not clear enough. Please take a clearer photo of the product front label." })
    }

    return NextResponse.json({ success: true, ...parsed })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Something went wrong: " + err.message })
  }
}