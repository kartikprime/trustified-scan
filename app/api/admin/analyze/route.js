import { NextResponse } from "next/server"
import { isValidDriveURL, extractDriveFileId, sanitizeText } from "@/lib/security"

const FSSAI_PARAMS = {
  whey_protein: {
    composition: ["Protein per serving (g)","Protein per 100g (%)","Carbohydrates (g)","Sugar (g)","Fat (g)","Saturated Fat (g)","Sodium (mg)","Calories (kcal)","Moisture (%)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Heavy Metals - Arsenic","Heavy Metals - Mercury","Protein Spiking - Creatine","Protein Spiking - Taurine","Protein Spiking - Glycine","Melamine","Non Protein Nitrogen","Microbial Count","Salmonella"],
  },
  whey_isolate: {
    composition: ["Protein per serving (g)","Protein per 100g (%)","Carbohydrates (g)","Sugar (g)","Lactose (g)","Fat (g)","Sodium (mg)","Calories (kcal)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Heavy Metals - Arsenic","Protein Spiking - Creatine","Protein Spiking - Glycine","Melamine","Non Protein Nitrogen","Microbial Count","Salmonella"],
  },
  plant_protein: {
    composition: ["Protein per serving (g)","Protein per 100g (%)","Carbohydrates (g)","Sugar (g)","Fat (g)","Fiber (g)","Sodium (mg)","Calories (kcal)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Heavy Metals - Arsenic","Pesticide Residue","Protein Spiking","Aflatoxin","Microbial Count","Salmonella"],
  },
  creatine: {
    composition: ["Creatine Monohydrate per serving (g)","Creatine per 100g (%)","Moisture (%)","pH"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Heavy Metals - Arsenic","Creatinine Impurity","Dicyandiamide (DCD)","Dihydrotriazine (DHT)","Microbial Count"],
  },
  pre_workout: {
    composition: ["Total Caffeine (mg)","Beta-Alanine (mg)","Citrulline (mg)","Arginine (mg)","Protein (g)","Carbohydrates (g)","Sodium (mg)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Arsenic","Banned Stimulants - DMAA","Banned Stimulants - DMHA","Caffeine Content","Artificial Colors","Microbial Count"],
  },
  mass_gainer: {
    composition: ["Protein per serving (g)","Carbohydrates (g)","Sugar (g)","Fat (g)","Calories (kcal)","Sodium (mg)","Fiber (g)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Protein Spiking","Melamine","Artificial Sweeteners","Microbial Count","Salmonella"],
  },
  multivitamin: {
    composition: ["Vitamin A","Vitamin B12","Vitamin C","Vitamin D3","Vitamin E","Iron","Zinc","Folate"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Heavy Metals - Arsenic","Label Accuracy","Undeclared Ingredients","Microbial Count"],
  },
  omega3: {
    composition: ["EPA (mg)","DHA (mg)","Total Omega 3 (mg)","Fish Oil per capsule (mg)","Peroxide Value"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Mercury","Heavy Metals - Cadmium","Heavy Metals - Arsenic","PCBs","Peroxide Value","Microbial Count"],
  },
  shilajit: {
    composition: ["Fulvic Acid (%)","Humic Acid (%)","Total Mineral Content (%)","Moisture (%)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Arsenic","Heavy Metals - Cadmium","Heavy Metals - Mercury","Microbial Count","Authenticity Test"],
  },
  protein_bar: {
    composition: ["Protein per bar (g)","Carbohydrates (g)","Sugar (g)","Fat (g)","Saturated Fat (g)","Fiber (g)","Calories (kcal)","Sodium (mg)"],
    safety: ["Heavy Metals - Lead","Protein Spiking","Artificial Colors","Trans Fat","Microbial Count","Aflatoxin"],
  },
  nut_butter: {
    composition: ["Protein (g)","Fat (g)","Saturated Fat (g)","Carbohydrates (g)","Sugar (g)","Fiber (g)","Sodium (mg)","Calories (kcal)"],
    safety: ["Aflatoxin","Heavy Metals - Lead","Heavy Metals - Cadmium","Pesticide Residue","Adulteration - Vegetable Oil","Trans Fat","Microbial Count"],
  },
  dark_chocolate: {
    composition: ["Cocoa Solids (%)","Sugar (g)","Fat (g)","Saturated Fat (g)","Protein (g)","Fiber (g)","Calories (kcal)"],
    safety: ["Heavy Metals - Cadmium","Heavy Metals - Lead","Aflatoxin","Pesticide Residue","Artificial Colors","Mineral Oil"],
  },
  default: {
    composition: ["Protein per serving (g)","Carbohydrates (g)","Sugar (g)","Fat (g)","Calories (kcal)","Sodium (mg)"],
    safety: ["Heavy Metals - Lead","Heavy Metals - Cadmium","Heavy Metals - Arsenic","Microbial Count","Label Accuracy"],
  },
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { driveUrl, productName, brandName, category } = body

    // S9 — Sanitize inputs
    const cleanProductName = sanitizeText(productName, 150)
    const cleanBrandName = sanitizeText(brandName, 100)

    if (!cleanProductName || cleanProductName.length < 2) {
      return NextResponse.json({ success: false, error: "Invalid product name" })
    }
    if (!cleanBrandName || cleanBrandName.length < 1) {
      return NextResponse.json({ success: false, error: "Invalid brand name" })
    }

    // S7 — Validate Google Drive URL
    if (!isValidDriveURL(driveUrl)) {
      return NextResponse.json({ success: false, error: "Invalid Google Drive URL. Only drive.google.com links are allowed." })
    }

    const fileId = extractDriveFileId(driveUrl)
    if (!fileId) {
      return NextResponse.json({ success: false, error: "Could not extract file ID from Drive URL." })
    }

    const params = FSSAI_PARAMS[category] || FSSAI_PARAMS.default
    const directUrl = "https://drive.google.com/uc?export=download&id=" + fileId

    const pdfResponse = await fetch(directUrl)
    if (!pdfResponse.ok) {
      return NextResponse.json({ success: false, error: "Cannot access PDF. Set sharing to Anyone with link can view." })
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64")

    const prompt = `You are an expert Indian health supplement lab report analyzer.

Analyze this lab test report for: "${cleanProductName}" by "${cleanBrandName}" (Category: ${category}).

MANDATORY parameters to check:
Composition: ${params.composition.join(", ")}
Safety: ${params.safety.join(", ")}

Instructions:
1. Extract ALL values found in the report
2. For parameters NOT found mark as "NOT_IN_REPORT"
3. Compare label claims vs lab results strictly
4. Calculate trust score: label accuracy (30%) + safety compliance (40%) + completeness (30%)
5. Check for amino spiking, melamine, non protein nitrogen if applicable

Return ONLY this exact JSON:
{
  "product_summary": "2-3 sentence safety summary",
  "trust_score": <0-100>,
  "overall_verdict": "SAFE or CAUTION or UNSAFE",
  "composition": [
    {
      "parameter_name": "name",
      "label_claim": "value or NA",
      "lab_result": "value or NOT_IN_REPORT",
      "status": "accurate or mismatch or borderline",
      "parameter_type": "macro or amino_acid or heavy_metal or general",
      "loq": "LOQ value if available or null",
      "unit": "unit if available or null"
    }
  ],
  "safety": [
    {
      "parameter_name": "name",
      "result": "value or NOT_IN_REPORT",
      "status": "safe or borderline or unsafe or not_tested",
      "safe_limit": "limit value",
      "details": "brief health explanation"
    }
  ],
  "missing_fssai_params": ["list of mandatory params not in report"],
  "label_missing_params": ["params found in lab but not on label"]
}`

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ inline_data: { mime_type: "application/pdf", data: pdfBase64 } }, { text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
        })
      }
    )

    if (!geminiResponse.ok) {
      return NextResponse.json({ success: false, error: "Gemini API error. Check your API key." })
    }

    const geminiData = await geminiResponse.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "AI could not parse the report." })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, data: parsed })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error: " + err.message })
  }
}