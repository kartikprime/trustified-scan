"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

const SUPPLEMENT_CATEGORIES = [
  { value: "all", label: "All" },
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

const POPULAR_SEARCHES = ["Whey Protein", "Creatine", "MuscleBlaze", "Nakpro", "Omega 3", "Protein Bar", "Ashwagandha", "Multivitamin"]

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [category, setCategory] = useState("all")
  const [minScore, setMinScore] = useState(0)
  const [maxScore, setMaxScore] = useState(100)
  const [sortBy, setSortBy] = useState("score_desc")
  const [suggestion, setSuggestion] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const spellTimer = useRef(null)

  useEffect(() => {
    if (searchParams.get("q")) handleSearch(searchParams.get("q"), 1)
  }, [])

  const checkSpelling = async (q) => {
    if (!q || q.length < 4) return
    try {
      const res = await fetch("/api/spell-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) })
      const data = await res.json()
      if (data.suggestion && data.suggestion.toLowerCase() !== q.toLowerCase()) setSuggestion(data.suggestion)
      else setSuggestion(null)
    } catch {}
  }

  const handleQueryChange = (val) => {
    setQuery(val)
    setSuggestion(null)
    if (spellTimer.current) clearTimeout(spellTimer.current)
    if (val.length >= 4) spellTimer.current = setTimeout(() => checkSpelling(val), 1500)
  }

  const handleSearch = async (q, pageNum = 1, cat, min, max, sort) => {
    const searchTerm = q || query
    if (!searchTerm.trim()) return
    setLoading(true); setSearched(true); setSuggestion(null)
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        category: cat || category,
        minScore: min !== undefined ? min : minScore,
        maxScore: max !== undefined ? max : maxScore,
        sort: sort || sortBy,
        page: pageNum,
      })
      const res = await fetch("/api/search?" + params.toString())
      const data = await res.json()
      if (pageNum === 1) setResults(data.products || [])
      else setResults(prev => [...prev, ...(data.products || [])])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setHasMore(data.hasMore || false)
      setPage(pageNum)
    } catch { setResults([]) }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    router.push("/search?q=" + encodeURIComponent(query))
    handleSearch(query, 1)
  }

  const useSuggestion = () => {
    setQuery(suggestion); setSuggestion(null)
    router.push("/search?q=" + encodeURIComponent(suggestion))
    handleSearch(suggestion, 1)
  }

  const loadMore = () => handleSearch(query, page + 1)

  const getScoreColor = (score) => score >= 75 ? "#00c853" : score >= 50 ? "#ff8f00" : "#ff3d57"
  const getScoreLabel = (score) => score >= 75 ? "SAFE" : score >= 50 ? "MODERATE" : "UNSAFE"

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "60px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: "900", color: "white", letterSpacing: "-1.5px", marginBottom: "12px" }}>Search Products</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "16px", marginBottom: "32px" }}>Search from Trustified lab-verified supplements database</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "10px", background: "white", borderRadius: "18px", padding: "8px 8px 8px 22px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
              <input type="text" value={query} onChange={e => handleQueryChange(e.target.value)} placeholder="Search protein powder, creatine, brand..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#0d1117", fontSize: "16px", padding: "8px 0" }}/>
              <button type="submit" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", fontWeight: "800", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap" }}>SEARCH</button>
            </div>
          </form>
          {suggestion && (
            <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>Did you mean:</span>
              <button onClick={useSuggestion} style={{ background: "white", color: "#0a5c36", border: "none", padding: "6px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>{suggestion}</button>
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(0,200,83,0.1)", padding: "12px 24px", position: "sticky", top: "70px", zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", overflowX: "auto", paddingBottom: "4px" }}>
            {SUPPLEMENT_CATEGORIES.slice(0, 9).map(cat => (
              <button key={cat.value} onClick={() => { setCategory(cat.value); if (searched) handleSearch(query, 1, cat.value) }} style={{ padding: "7px 16px", borderRadius: "100px", border: "1px solid", borderColor: category === cat.value ? "#00c853" : "rgba(0,200,83,0.2)", background: category === cat.value ? "linear-gradient(135deg,#0a5c36,#00c853)" : "white", color: category === cat.value ? "white" : "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>{cat.label}</button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: "7px 16px", borderRadius: "100px", border: "1px solid rgba(0,200,83,0.2)", background: showFilters ? "rgba(0,200,83,0.08)" : "white", color: "#0a5c36", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>Filters {showFilters ? "▲" : "▼"}</button>
          </div>
          {showFilters && (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(0,200,83,0.08)" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Score: {minScore} — {maxScore}</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input type="range" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#00c853" }}/>
                  <input type="range" min="0" max="100" value={maxScore} onChange={e => setMaxScore(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#00c853" }}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ display: "block", marginTop: "6px", padding: "6px 12px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", fontSize: "13px", color: "#0d1117", outline: "none", background: "white" }}>
                  <option value="score_desc">Highest Score</option>
                  <option value="score_asc">Lowest Score</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
              <button onClick={() => handleSearch(query, 1)} style={{ alignSelf: "flex-end", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Apply</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Not searched yet */}
        {!searched && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>Search Any Supplement</h2>
            <p style={{ color: "#9ca3af", fontSize: "16px", maxWidth: "400px", margin: "0 auto 32px" }}>Type a product name or brand to see Trustified lab-verified results</p>
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#9ca3af", marginBottom: "12px", letterSpacing: "0.5px" }}>POPULAR SEARCHES</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {POPULAR_SEARCHES.map(term => (
                  <button key={term} onClick={() => { setQuery(term); handleSearch(term, 1) }} style={{ background: "white", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "100px", padding: "8px 18px", color: "#0a5c36", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{term}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/rankings" style={{ background: "white", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "12px", padding: "12px 20px", color: "#0a5c36", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>📊 View Rankings</a>
              <a href="/request" style={{ background: "white", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "12px", padding: "12px 20px", color: "#0a5c36", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>📝 Request a Test</a>
              <a href="/compare" style={{ background: "white", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "12px", padding: "12px 20px", color: "#0a5c36", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>⚖️ Compare Products</a>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && page === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ height: "20px", width: "150px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "8px" }}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: "white", borderRadius: "20px", padding: "22px", border: "1px solid rgba(0,200,83,0.08)", height: "160px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}/>
              ))}
            </div>
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔬</div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>Product Not Tested Yet</h2>
            <p style={{ color: "#9ca3af", fontSize: "16px", maxWidth: "480px", margin: "0 auto 16px" }}>
              <strong style={{ color: "#0d1117" }}>"{query}"</strong> has not been tested by Trustified yet. Only lab-verified products appear in results.
            </p>
            <div style={{ background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "12px", padding: "16px 20px", maxWidth: "400px", margin: "0 auto 28px", fontSize: "14px", color: "#0a5c36", lineHeight: "1.6" }}>
              💡 Try searching for a brand name like <strong>MuscleBlaze</strong> or <strong>Nakpro</strong>, or a category like <strong>Whey Protein</strong>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/request" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", textDecoration: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "800" }}>📝 Request This Test</a>
              <a href="https://www.youtube.com/@Trustified-Certification" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", color: "#c62828", textDecoration: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "700" }}>▶ Watch on YouTube</a>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117" }}>{total} result{total !== 1 ? "s" : ""} for "{query}"</h2>
              <span style={{ background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "100px", padding: "6px 14px", fontSize: "12px", color: "#0a5c36", fontWeight: "700" }}>✅ Lab Verified Only</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
              {results.map(product => (
                <a key={product.id} href={"/product/" + product.id} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", border: "1px solid rgba(0,200,83,0.1)", borderRadius: "20px", padding: "22px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", transition: "all 0.3s ease", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "3px", background: "linear-gradient(90deg,transparent," + getScoreColor(product.trust_score) + ",transparent)" }}/>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                        {product.product_image_url ? (
                          <img src={product.product_image_url} alt={product.name} loading="lazy" style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "contain", background: "#f8faf8", border: "1px solid rgba(0,200,83,0.1)", flexShrink: 0 }} onError={e => e.target.style.display = "none"}/>
                        ) : (
                          <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "rgba(0,200,83,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>💊</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>{product.brand}</div>
                          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</h3>
                        </div>
                      </div>
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(product.trust_score) + " " + (product.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "12px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                      {product.is_gold_certified && <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px" }}>🏆 GOLD</span>}
                      <span style={{ background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "100px", padding: "4px 12px", fontSize: "12px", color: "#0a5c36", fontWeight: "600" }}>{product.category?.replace(/_/g," ")}</span>
                      <span style={{ borderRadius: "100px", padding: "4px 12px", fontSize: "12px", color: getScoreColor(product.trust_score), fontWeight: "700", background: getScoreColor(product.trust_score) + "15", border: "1px solid " + getScoreColor(product.trust_score) + "30" }}>{getScoreLabel(product.trust_score)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                      <span style={{ color: "#9ca3af", fontSize: "12px" }}>{product.product_code}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {product.discounted_price && <span style={{ fontSize: "14px", fontWeight: "800", color: "#0a5c36" }}>₹{product.discounted_price}</span>}
                        <span style={{ color: "#0a5c36", fontWeight: "700", fontSize: "12px" }}>View Report →</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Load More / Pagination */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button onClick={loadMore} disabled={loading} style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 40px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Loading..." : "Load More Products"}
                </button>
                <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "12px" }}>Showing {results.length} of {total} results</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(0,200,83,0.2)", borderTop: "3px solid #00c853", borderRadius: "50%", animation: "spin 1s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  )
}