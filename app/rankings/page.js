"use client"
import { useState, useEffect } from "react"

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "whey_protein", label: "Whey Protein" },
  { value: "whey_isolate", label: "Whey Isolate" },
  { value: "plant_protein", label: "Plant Protein" },
  { value: "creatine", label: "Creatine" },
  { value: "pre_workout", label: "Pre Workout" },
  { value: "mass_gainer", label: "Mass Gainer" },
  { value: "multivitamin", label: "Multivitamin" },
  { value: "omega3", label: "Omega 3" },
  { value: "shilajit", label: "Shilajit" },
  { value: "protein_bar", label: "Protein Bar" },
  { value: "nut_butter", label: "Nut Butter" },
  { value: "dark_chocolate", label: "Dark Chocolate" },
  { value: "bcaa", label: "BCAA" },
  { value: "fat_burner", label: "Fat Burner" },
  { value: "other_supplement", label: "Other" },
]

export default function RankingsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("score_desc")
  const [minScore, setMinScore] = useState(0)
  const [maxScore, setMaxScore] = useState(100)

  useEffect(() => { fetchRankings() }, [category, sort, minScore, maxScore])

  const fetchRankings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/rankings?category=" + category + "&sort=" + sort + "&minScore=" + minScore + "&maxScore=" + maxScore)
      const data = await res.json()
      setProducts(data.products || [])
    } catch { setProducts([]) }
    setLoading(false)
  }

  const getScoreColor = (score) => score >= 75 ? "#00c853" : score >= 50 ? "#ff8f00" : "#ff3d57"
  const getScoreLabel = (score) => score >= 75 ? "Safe" : score >= 50 ? "Caution" : "Unsafe"

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Product Safety Rankings</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>All Trustified tested supplements ranked by safety score</p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(0,200,83,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", fontSize: "14px", color: "#0d1117", outline: "none", background: "white" }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>Sort By</label>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", fontSize: "14px", color: "#0d1117", outline: "none", background: "white" }}>
              <option value="score_desc">Highest Score First</option>
              <option value="score_asc">Lowest Score First</option>
              <option value="newest">Newest Tests First</option>
            </select>
          </div>
          <div style={{ flex: 2, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>Score Range: {minScore} — {maxScore}</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="range" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#00c853" }}/>
              <input type="range" min="0" max="100" value={maxScore} onChange={e => setMaxScore(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#00c853" }}/>
            </div>
          </div>
        </div>

        {loading ? (
          <div>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: "72px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "16px", marginBottom: "10px" }}/>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>No Products Found</h3>
            <p style={{ color: "#9ca3af" }}>No products match your filters. Try changing category or score range.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>{products.length} products found</p>
            {products.map((product, index) => (
              <a key={product.id} href={"/product/" + product.id} style={{ textDecoration: "none" }}>
                <div style={{ background: "white", borderRadius: "16px", padding: "18px 22px", border: "1px solid rgba(0,200,83,0.08)", display: "flex", alignItems: "center", gap: "16px", transition: "all 0.2s ease" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: index < 3 ? "linear-gradient(135deg,#0a5c36,#00c853)" : "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "900", color: index < 3 ? "white" : "#9ca3af", flexShrink: 0 }}>#{index + 1}</div>
                  {product.product_image_url && <img src={product.product_image_url} alt={product.name} loading="lazy" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "contain", background: "#f8faf8", border: "1px solid rgba(0,200,83,0.1)", flexShrink: 0 }} onError={e => e.target.style.display = "none"}/>}
                  <div style={{ flex: 1, minWidth: "0" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>{product.brand}</div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{product.category?.replace(/_/g," ")} · {product.test_date ? new Date(product.test_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"}</div>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(product.trust_score) + " " + (product.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", color: getScoreColor(product.trust_score), fontWeight: "700", marginTop: "4px" }}>{getScoreLabel(product.trust_score)}</div>
                  </div>
                  {product.youtube_url && (
                    <a href={product.youtube_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ flexShrink: 0, width: "36px", height: "36px", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff0000", textDecoration: "none", fontSize: "14px" }}>▶</a>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}