"use client"
import { useState } from "react"

const SUPPLEMENT_INGREDIENTS = [
  "Whey Protein Concentrate","Whey Protein Isolate","Creatine Monohydrate",
  "Beta-Alanine","Caffeine Anhydrous","L-Citrulline","BCAA",
  "Glutamine","Casein Protein","Soy Protein Isolate",
  "Pea Protein","Brown Rice Protein","Collagen Peptides",
  "Omega-3 Fish Oil","EPA","DHA","Vitamin D3",
  "Magnesium Glycinate","Zinc Picolinate","Ashwagandha Extract",
  "Shilajit","Turmeric Curcumin","Spirulina",
  "Amino Spiking - Glycine","Amino Spiking - Taurine","Amino Spiking - Creatine",
  "Melamine","Non Protein Nitrogen","Acesulfame-K",
  "Sucralose","Stevia","Artificial Colors","Trans Fat",
]

export default function IngredientsPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const explain = async (ingredient) => {
    setLoading(true); setError(""); setResult(null); setQuery(ingredient)
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient })
      })
      const data = await res.json()
      if (data.success) setResult(data.data)
      else setError("Could not explain this ingredient. Please try again.")
    } catch { setError("Something went wrong.") }
    setLoading(false)
  }

  const getSafetyColor = (level) => level === "safe" ? "#00c853" : level === "caution" ? "#ff8f00" : "#ff3d57"
  const getSafetyBg = (level) => level === "safe" ? "rgba(0,200,83,0.08)" : level === "caution" ? "rgba(255,143,0,0.08)" : "rgba(255,61,87,0.08)"

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Ingredient Explainer</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>Ask AI to explain any supplement ingredient, additive or chemical in simple language</p>
      </div>

      <div style={{ maxWidth: "800px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "28px", marginBottom: "20px", border: "1px solid rgba(0,200,83,0.1)" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && query.trim() && explain(query)} placeholder="Type any ingredient e.g. Creatine Monohydrate, Beta-Alanine..." style={{ flex: 1, padding: "12px 16px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", fontSize: "15px", color: "#0d1117", outline: "none" }}/>
            <button onClick={() => query.trim() && explain(query)} disabled={!query.trim() || loading} style={{ background: query.trim() ? "linear-gradient(135deg,#0a5c36,#00c853)" : "#e5e7eb", color: query.trim() ? "white" : "#9ca3af", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: query.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
              {loading ? "Explaining..." : "Explain"}
            </button>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", marginBottom: "10px", letterSpacing: "0.5px" }}>COMMONLY SEARCHED</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {SUPPLEMENT_INGREDIENTS.map(ing => (
                <button key={ing} onClick={() => explain(ing)} style={{ background: "#f8faf8", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "100px", padding: "6px 14px", fontSize: "12px", color: "#0a5c36", fontWeight: "600", cursor: "pointer" }}>{ing}</button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", border: "1px solid rgba(0,200,83,0.1)" }}>
            <div style={{ width: "48px", height: "48px", border: "3px solid rgba(0,200,83,0.2)", borderTop: "3px solid #00c853", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: "#6b7280", fontWeight: "600" }}>AI is explaining {query}...</p>
          </div>
        )}

        {error && <div style={{ background: "rgba(255,61,87,0.08)", border: "1px solid rgba(255,61,87,0.2)", borderRadius: "12px", padding: "14px 18px", color: "#c62828", fontSize: "14px", fontWeight: "600" }}>{error}</div>}

        {result && !loading && (
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0d1117" }}>{result.name}</h2>
              <span style={{ padding: "8px 18px", borderRadius: "100px", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", background: getSafetyBg(result.safety_level), color: getSafetyColor(result.safety_level), border: "1px solid " + getSafetyColor(result.safety_level) + "40" }}>{result.safety_level}</span>
            </div>
            {[
              { label: "What is it?", value: result.what_is_it, icon: "🔬" },
              { label: "Why is it used?", value: result.why_used, icon: "🏭" },
              { label: "Health Impact", value: result.health_impact, icon: "💊" },
              { label: "FSSAI Status in India", value: result.fssai_status, icon: "📋" },
              { label: "Healthier Alternatives", value: result.alternatives, icon: "🌿" },
            ].map((item, i) => item.value && (
              <div key={i} style={{ padding: "16px 0", borderBottom: i < 4 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>{item.label}</div>
                    <p style={{ color: "#0d1117", fontSize: "14px", lineHeight: "1.75" }}>{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}