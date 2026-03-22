"use client"
import { useState, useEffect } from "react"

const CATEGORIES = [
  { value: "all", label: "All Products", icon: "🛒" },
  { value: "whey_protein", label: "Whey Protein", icon: "💪" },
  { value: "whey_isolate", label: "Whey Isolate", icon: "⚡" },
  { value: "plant_protein", label: "Plant Protein", icon: "🌱" },
  { value: "creatine", label: "Creatine", icon: "🔥" },
  { value: "pre_workout", label: "Pre Workout", icon: "⚡" },
  { value: "mass_gainer", label: "Mass Gainer", icon: "📈" },
  { value: "multivitamin", label: "Multivitamin", icon: "💊" },
  { value: "omega3", label: "Omega 3", icon: "🐟" },
  { value: "shilajit", label: "Shilajit", icon: "🪨" },
  { value: "protein_bar", label: "Protein Bar", icon: "🍫" },
  { value: "nut_butter", label: "Nut Butter", icon: "🥜" },
  { value: "dark_chocolate", label: "Dark Chocolate", icon: "🍫" },
  { value: "bcaa", label: "BCAA", icon: "🧬" },
  { value: "fat_burner", label: "Fat Burner", icon: "🔥" },
]

const SORT_OPTIONS = [
  { value: "featured", label: "Featured First" },
  { value: "score", label: "Highest Safety Score" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
]

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("featured")

  useEffect(() => { fetchProducts() }, [category, sort])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/shop?category=" + category + "&sort=" + sort)
      const data = await res.json()
      setProducts(data.products || [])
    } catch { setProducts([]) }
    setLoading(false)
  }

  const getScoreColor = (score) => score >= 75 ? "#00c853" : score >= 50 ? "#ff8f00" : "#ff3d57"
  const getScoreLabel = (score) => score >= 75 ? "SAFE" : score >= 50 ? "CAUTION" : "UNSAFE"

  const groupedProducts = CATEGORIES.slice(1).reduce((acc, cat) => {
    const catProducts = products.filter(p => p.category === cat.value)
    if (catProducts.length > 0) acc[cat.value] = { ...cat, products: catProducts }
    return acc
  }, {})

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: "-20%", left: "-5%", width: "250px", height: "250px", background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }}/>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "8px 20px", marginBottom: "16px", fontSize: "13px", color: "white", fontWeight: "700" }}>
          🛡️ Only Trustified Lab-Verified Products
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: "900", color: "white", letterSpacing: "-1.5px", marginBottom: "12px" }}>Safe Supplements Shop</h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", maxWidth: "520px", margin: "0 auto 24px", lineHeight: "1.7" }}>
          Every product here has been independently lab tested by Trustified. Buy with confidence — no untested products ever listed.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "✅", text: "Lab Verified" },
            { icon: "🔬", text: "Blind Tested" },
            { icon: "🏆", text: "Gold Certified Available" },
            { icon: "💰", text: "Best Prices" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.12)", borderRadius: "100px", padding: "8px 16px", fontSize: "13px", color: "white", fontWeight: "600" }}>
              <span>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(0,200,83,0.1)", padding: "16px 24px", position: "sticky", top: "70px", zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)} style={{ padding: "7px 16px", borderRadius: "100px", border: "1px solid", borderColor: category === cat.value ? "#00c853" : "rgba(0,200,83,0.2)", background: category === cat.value ? "linear-gradient(135deg,#0a5c36,#00c853)" : "white", color: category === cat.value ? "white" : "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "8px 16px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", fontSize: "14px", color: "#0d1117", outline: "none", background: "white", cursor: "pointer", flexShrink: 0 }}>
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 24px 60px" }}>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: "380px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "20px" }}/>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>No Products Available</h2>
            <p style={{ color: "#9ca3af", fontSize: "16px", maxWidth: "400px", margin: "0 auto 24px" }}>
              No products with buy links found in this category. Check back soon or browse all categories.
            </p>
            <button onClick={() => setCategory("all")} style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>View All Products</button>
          </div>
        ) : category !== "all" ? (
          // Single category view
          <div>
            <p style={{ color: "#6b7280", fontSize: "14px", fontWeight: "600", marginBottom: "20px" }}>{products.length} products found</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
              {products.map(product => <ProductCard key={product.id} product={product} getScoreColor={getScoreColor} getScoreLabel={getScoreLabel}/>)}
            </div>
          </div>
        ) : (
          // Category-wise view
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {Object.values(groupedProducts).map(cat => (
              <div key={cat.value}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "28px" }}>{cat.icon}</span>
                    <div>
                      <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0d1117", marginBottom: "2px" }}>{cat.label}</h2>
                      <p style={{ color: "#9ca3af", fontSize: "13px" }}>{cat.products.length} lab verified products</p>
                    </div>
                  </div>
                  <button onClick={() => setCategory(cat.value)} style={{ background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", color: "#0a5c36", padding: "8px 18px", borderRadius: "100px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>View All →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
                  {cat.products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} getScoreColor={getScoreColor} getScoreLabel={getScoreLabel}/>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISCLAIMER */}
      <div style={{ background: "rgba(255,143,0,0.06)", borderTop: "1px solid rgba(255,143,0,0.15)", padding: "16px 24px", textAlign: "center" }}>
        <p style={{ color: "#e65100", fontSize: "12px", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
          ⚠️ Affiliate Disclosure: Some links on this page are affiliate links. If you purchase through these links we may earn a small commission at no extra cost to you. This does not influence our lab test results or ratings. All products are independently tested.
        </p>
      </div>
    </div>
  )
}

function ProductCard({ product, getScoreColor, getScoreLabel }) {
  const discount = product.price && product.discounted_price
    ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
    : null

  return (
    <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: "1px solid " + (product.is_gold_certified ? "rgba(245,158,11,0.3)" : "rgba(0,200,83,0.1)"), boxShadow: product.is_featured ? "0 8px 40px rgba(0,200,83,0.15)" : "0 2px 12px rgba(0,0,0,0.04)", position: "relative", transition: "all 0.2s ease" }}>

      {/* Badges */}
      <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, display: "flex", flexDirection: "column", gap: "6px" }}>
        {product.is_gold_certified && (
          <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "3px" }}>🏆 GOLD</span>
        )}
        {product.is_featured && !product.is_gold_certified && (
          <span style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>⭐ FEATURED</span>
        )}
        {discount && discount > 0 && (
          <span style={{ background: "#ff3d57", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>{discount}% OFF</span>
        )}
      </div>

      {/* Offer badge */}
      {product.offer_text && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2, background: "rgba(255,61,87,0.9)", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", maxWidth: "120px", textAlign: "center", lineHeight: "1.3" }}>
          🎁 {product.offer_text}
        </div>
      )}

      {/* Product Image */}
      <a href={"/product/" + product.id} style={{ textDecoration: "none", display: "block" }}>
        {product.product_image_url ? (
          <div style={{ height: "200px", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", borderBottom: "1px solid rgba(0,200,83,0.06)" }}>
            <img src={product.product_image_url} alt={product.name} loading="lazy" style={{ maxHeight: "168px", maxWidth: "100%", objectFit: "contain" }} onError={e => { e.target.parentElement.innerHTML = "<div style='font-size:56px'>💊</div>" }}/>
          </div>
        ) : (
          <div style={{ height: "200px", background: "linear-gradient(135deg,rgba(0,200,83,0.06),rgba(10,92,54,0.03))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", borderBottom: "1px solid rgba(0,200,83,0.06)" }}>💊</div>
        )}
      </a>

      {/* Product Info */}
      <div style={{ padding: "18px" }}>
        <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{product.brand}</div>
        <a href={"/product/" + product.id} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", marginBottom: "8px", lineHeight: "1.3" }}>{product.name}</h3>
        </a>
        {product.short_description && (
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.short_description}</p>
        )}

        {/* Trust Score */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(product.trust_score) + " " + (product.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: getScoreColor(product.trust_score) }}>{getScoreLabel(product.trust_score)}</div>
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>Trustified Score</div>
          </div>
          <a href={"/product/" + product.id} style={{ marginLeft: "auto", fontSize: "11px", color: "#0a5c36", fontWeight: "700", textDecoration: "none" }}>View Report →</a>
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          {product.discounted_price ? (
            <>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#0d1117" }}>₹{product.discounted_price}</span>
              {product.price && product.price !== product.discounted_price && (
                <span style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "line-through" }}>₹{product.price}</span>
              )}
              {discount > 0 && <span style={{ fontSize: "12px", fontWeight: "800", color: "#ff3d57" }}>Save ₹{product.price - product.discounted_price}</span>}
            </>
          ) : (
            <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "600" }}>Price not listed</span>
          )}
        </div>

        {/* Buy Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {product.affiliate_link && (
            <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", textDecoration: "none", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "800" }}>
              🛒 Buy on Trustified Shop
            </a>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            {product.amazon_link && (
              <a href={product.amazon_link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#FF9900", color: "white", textDecoration: "none", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "800" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.872-1.236-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.383-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.57 1.513 8.763 0 11.76 0c1.583 0 3.651.42 4.898 1.619C18.106 2.978 17.97 4.81 17.97 6.8v5.165c0 1.555.644 2.238 1.251 3.077.215.299.261.659-.01.882l-2.067 1.871zM23.27 19.802C20.83 21.917 17.33 23 14.319 23c-4.868 0-9.242-1.8-12.56-4.799-.261-.237-.028-.56.285-.376 3.574 2.078 7.993 3.327 12.558 3.327 3.078 0 6.46-.636 9.573-1.955.419-.181.768.276.322.605"/></svg>
                Amazon
              </a>
            )}
            {product.flipkart_link && (
              <a href={product.flipkart_link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#2874F0", color: "white", textDecoration: "none", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "800" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 2h20v20H2z" opacity="0"/><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Flipkart
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}