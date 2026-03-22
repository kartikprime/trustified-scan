"use client"
import { useState, useEffect } from "react"

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [brandProducts, setBrandProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => { fetchBrands() }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/public-brands")
      const data = await res.json()
      setBrands(data.brands || [])
    } catch { setBrands([]) }
    setLoading(false)
  }

  const fetchBrandProducts = async (brand) => {
    setLoadingProducts(true)
    setSelectedBrand(brand)
    setBrandProducts([])
    try {
      const res = await fetch("/api/public-brands?slug=" + brand.slug)
      const data = await res.json()
      setBrandProducts(data.products || [])
    } catch { setBrandProducts([]) }
    setLoadingProducts(false)
  }

  const getScoreColor = (score) => score >= 75 ? "#00c853" : score >= 50 ? "#ff8f00" : "#ff3d57"
  const getGrade = (score) => score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : score >= 50 ? "C" : "D"

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Certified Brands</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>Brands that have been independently tested and verified by Trustified</p>
      </div>

      <div style={{ maxWidth: "1200px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: "120px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "16px" }}/>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : brands.length === 0 ? (
          <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🏭</div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>No Certified Brands Yet</h3>
            <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "400px", margin: "0 auto" }}>Trustified certified brands will appear here once added by the admin team.</p>
          </div>
        ) : (
          <div>
            {/* Brand Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px", marginBottom: "32px" }}>
              {brands.map(brand => (
                <button key={brand.id} onClick={() => selectedBrand?.id === brand.id ? setSelectedBrand(null) : fetchBrandProducts(brand)} style={{ background: selectedBrand?.id === brand.id ? "linear-gradient(135deg,#0a5c36,#00c853)" : "white", border: selectedBrand?.id === brand.id ? "none" : "1px solid " + (brand.is_gold_partner ? "rgba(245,158,11,0.3)" : "rgba(0,200,83,0.1)"), borderRadius: "16px", padding: "20px", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "10px", marginBottom: "10px", display: "block", margin: "0 auto 10px", background: selectedBrand?.id === brand.id ? "rgba(255,255,255,0.2)" : "#f8faf8", padding: "4px" }} onError={e => e.target.style.display = "none"}/>
                  ) : (
                    <div style={{ width: "60px", height: "60px", borderRadius: "10px", background: brand.is_gold_partner ? "linear-gradient(135deg,#fef3c7,#fde68a)" : "rgba(0,200,83,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 10px" }}>{brand.is_gold_partner ? "🏆" : "🏭"}</div>
                  )}
                  <div style={{ fontSize: "14px", fontWeight: "800", color: selectedBrand?.id === brand.id ? "white" : "#0d1117", marginBottom: "4px" }}>{brand.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                    <span style={{ fontSize: "18px", fontWeight: "900", color: selectedBrand?.id === brand.id ? "white" : getScoreColor(brand.avgScore || 0) }}>{getGrade(brand.avgScore || 0)}</span>
                    <span style={{ fontSize: "11px", color: selectedBrand?.id === brand.id ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>{brand.productCount || 0} tested</span>
                  </div>
                  {brand.is_gold_partner && <span style={{ display: "inline-block", marginTop: "6px", background: selectedBrand?.id === brand.id ? "rgba(255,255,255,0.2)" : "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "9px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>🏆 GOLD</span>}
                </button>
              ))}
            </div>

            {/* Brand Products */}
            {selectedBrand && (
              <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.1)", boxShadow: "0 4px 20px rgba(0,200,83,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0d1117", marginBottom: "4px" }}>{selectedBrand.name}</h2>
                    <p style={{ color: "#9ca3af", fontSize: "14px" }}>{brandProducts.length} products tested by Trustified</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {selectedBrand.website_url && <a href={selectedBrand.website_url} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: "8px", background: "#f8faf8", color: "#6b7280", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>🌐 Website</a>}
                    {selectedBrand.shop_url && <a href={selectedBrand.shop_url} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(0,200,83,0.08)", color: "#0a5c36", textDecoration: "none", fontSize: "13px", fontWeight: "700", border: "1px solid rgba(0,200,83,0.2)" }}>🛒 Buy Products</a>}
                  </div>
                </div>

                {selectedBrand.description && <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>{selectedBrand.description}</p>}

                {loadingProducts ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ width: "36px", height: "36px", border: "3px solid rgba(0,200,83,0.2)", borderTop: "3px solid #00c853", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }}/>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                ) : brandProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", background: "#f8faf8", borderRadius: "12px" }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔬</div>
                    <p>No published products yet for this brand.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "14px" }}>
                    {brandProducts.map(product => (
                      <a key={product.id} href={"/product/" + product.id} style={{ textDecoration: "none" }}>
                        <div style={{ background: "#f8faf8", borderRadius: "14px", padding: "16px", border: "1px solid rgba(0,200,83,0.08)", transition: "all 0.2s ease", display: "flex", gap: "12px", alignItems: "center" }}>
                          {product.product_image_url ? (
                            <img src={product.product_image_url} alt={product.name} loading="lazy" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "contain", background: "white", border: "1px solid rgba(0,200,83,0.1)", flexShrink: 0 }} onError={e => e.target.style.display = "none"}/>
                          ) : (
                            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>💊</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {product.is_gold_certified && <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginBottom: "3px" }}>🏆 GOLD</span>}
                            <div style={{ fontSize: "13px", fontWeight: "800", color: "#0d1117", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                              <span style={{ fontSize: "13px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}/100</span>
                              {product.discounted_price && <span style={{ fontSize: "12px", fontWeight: "700", color: "#0a5c36" }}>₹{product.discounted_price}</span>}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}