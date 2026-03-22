"use client"
import { useState } from "react"

export default function ComparePage() {
  const [search1, setSearch1] = useState("")
  const [search2, setSearch2] = useState("")
  const [results1, setResults1] = useState([])
  const [results2, setResults2] = useState([])
  const [selected1, setSelected1] = useState(null)
  const [selected2, setSelected2] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchProducts = async (query, setResults) => {
    if (!query.trim()) return
    try {
      const res = await fetch("/api/search?q=" + encodeURIComponent(query) + "&page=1")
      const data = await res.json()
      setResults(data.products || [])
    } catch { setResults([]) }
  }

  const handleCompare = async () => {
    if (!selected1 || !selected2) return
    if (selected1.id === selected2.id) { setError("Please select two different products"); return }
    setLoading(true); setError(""); setComparison(null)
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [selected1.id, selected2.id] })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setComparison(data)
    } catch { setError("Something went wrong. Please try again.") }
    setLoading(false)
  }

  const getScoreColor = (score) => score >= 75 ? "#00c853" : score >= 50 ? "#ff8f00" : "#ff3d57"
  const getScoreLabel = (score) => score >= 75 ? "SAFE" : score >= 50 ? "CAUTION" : "UNSAFE"
  const getStatusColor = (status) => {
    if (!status) return "#9ca3af"
    const s = status.toLowerCase()
    if (s === "safe" || s === "accurate") return "#00c853"
    if (s === "borderline" || s === "mismatch") return "#ff8f00"
    return "#ff3d57"
  }

  const ProductSelector = ({ search, setSearch, results, setResults, selected, setSelected, label }) => (
    <div style={{ flex: 1, minWidth: "280px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>{label}</h3>
      {selected ? (
        <div style={{ background: "white", borderRadius: "14px", padding: "18px", border: "2px solid rgba(0,200,83,0.2)", position: "relative" }}>
          <button onClick={() => { setSelected(null); setComparison(null) }} style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
          {selected.product_image_url && (
            <img src={selected.product_image_url} alt={selected.name} style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", background: "#f8faf8", marginBottom: "10px", display: "block" }} onError={e => e.target.style.display = "none"}/>
          )}
          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", marginBottom: "3px" }}>{selected.brand}</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", marginBottom: "8px", paddingRight: "24px" }}>{selected.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(selected.trust_score) + " " + (selected.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "900", color: getScoreColor(selected.trust_score) }}>{selected.trust_score}</span>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "800", color: getScoreColor(selected.trust_score) }}>{getScoreLabel(selected.trust_score)}</span>
            {selected.discounted_price && <span style={{ fontSize: "14px", fontWeight: "800", color: "#0a5c36", marginLeft: "auto" }}>₹{selected.discounted_price}</span>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchProducts(search, setResults)} placeholder="Search product name..." style={{ flex: 1, padding: "10px 14px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", fontSize: "14px", color: "#0d1117", outline: "none" }}/>
            <button onClick={() => searchProducts(search, setResults)} style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Search</button>
          </div>
          {results.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid rgba(0,200,83,0.1)", overflow: "hidden", maxHeight: "260px", overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              {results.map(p => (
                <button key={p.id} onClick={() => { setSelected(p); setResults([]) }} style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.2s" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>{p.brand}</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0d1117", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: "900", color: getScoreColor(p.trust_score), marginLeft: "12px", flexShrink: 0 }}>{p.trust_score}</span>
                </button>
              ))}
            </div>
          )}
          {results.length === 0 && search.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid rgba(0,200,83,0.1)", padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
              No results. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Compare Products</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>Compare safety scores and lab results side by side</p>
      </div>

      <div style={{ maxWidth: "1000px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>

        {/* Selector */}
        <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.1)", marginBottom: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "20px", alignItems: "flex-start" }}>
            <ProductSelector search={search1} setSearch={setSearch1} results={results1} setResults={setResults1} selected={selected1} setSelected={setSelected1} label="Product 1"/>
            <div style={{ display: "flex", alignItems: "center", fontSize: "20px", fontWeight: "900", color: "#9ca3af", paddingTop: "40px", flexShrink: 0 }}>VS</div>
            <ProductSelector search={search2} setSearch={setSearch2} results={results2} setResults={setResults2} selected={selected2} setSelected={setSelected2} label="Product 2"/>
          </div>

          {error && <div style={{ background: "rgba(255,61,87,0.08)", border: "1px solid rgba(255,61,87,0.2)", borderRadius: "10px", padding: "12px 16px", color: "#c62828", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>{error}</div>}

          <button onClick={handleCompare} disabled={!selected1 || !selected2 || loading} style={{ width: "100%", background: selected1 && selected2 ? "linear-gradient(135deg,#0a5c36,#00c853)" : "#e5e7eb", color: selected1 && selected2 ? "white" : "#9ca3af", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: selected1 && selected2 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {loading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }}/> Comparing...</> : "⚖️ Compare Products"}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>

        {/* Empty state */}
        {!comparison && !loading && (
          <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>⚖️</div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0d1117", marginBottom: "10px" }}>How to Compare</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "360px", margin: "0 auto", textAlign: "left" }}>
              {["Search for Product 1 using the search box above", "Search for Product 2 in the second box", "Click Compare Products to see side by side results", "AI will give you a safety comparison summary"].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5", paddingTop: "2px" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {comparison && (
          <div>
            {comparison.aiSummary && (
              <div style={{ background: "white", borderRadius: "16px", padding: "22px", marginBottom: "16px", border: "1px solid rgba(0,200,83,0.1)", borderLeft: "4px solid #00c853" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", marginBottom: "8px", letterSpacing: "1px" }}>🤖 AI COMPARISON SUMMARY</div>
                <p style={{ color: "#0d1117", fontSize: "15px", lineHeight: "1.7" }}>{comparison.aiSummary}</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {comparison.products.map(({ product, composition, safety }) => product && (
                <div key={product.id} style={{ background: "white", borderRadius: "16px", padding: "22px", border: "1px solid rgba(0,200,83,0.1)" }}>
                  {product.product_image_url && <img src={product.product_image_url} alt={product.name} style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", background: "#f8faf8", marginBottom: "12px", display: "block" }} onError={e => e.target.style.display = "none"}/>}
                  <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", marginBottom: "3px" }}>{product.brand}</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>{product.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(product.trust_score) + " " + (product.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: getScoreColor(product.trust_score) }}>{getScoreLabel(product.trust_score)}</div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>{composition.length} params · {safety.length} safety checks</div>
                    </div>
                  </div>
                  {safety.slice(0, 5).map(s => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: "13px" }}>
                      <span style={{ color: "#6b7280" }}>{s.parameter_name}</span>
                      <span style={{ fontWeight: "700", color: getStatusColor(s.status), textTransform: "uppercase", fontSize: "11px" }}>{s.status}</span>
                    </div>
                  ))}
                  <a href={"/product/" + product.id} style={{ display: "block", textAlign: "center", marginTop: "14px", padding: "10px", background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", color: "#0a5c36", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>View Full Report →</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}