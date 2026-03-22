"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [counts, setCounts] = useState({ products: 0, blind: 100, params: 0, paid: 0 })
  const [goldProducts, setGoldProducts] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const canvasRef = useRef(null)
  const card1 = useRef(null)
  const card2 = useRef(null)
  const card3 = useRef(null)
  const cardRefs = [card1, card2, card3]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) router.push("/search?q=" + encodeURIComponent(searchQuery.trim()))
  }

  // P1 fix — Single API call for all homepage data
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const res = await fetch("/api/homepage")
        const data = await res.json()

        // Animate stats counter
        const targets = { products: data.stats?.products || 0, blind: 100, params: data.stats?.params || 0, paid: 0 }
        const steps = 60
        let step = 0
        const timer = setInterval(() => {
          step++
          const eased = 1 - Math.pow(1 - step / steps, 3)
          setCounts({
            products: Math.round(targets.products * eased),
            blind: Math.round(targets.blind * eased),
            params: Math.round(targets.params * eased),
            paid: 0,
          })
          if (step >= steps) clearInterval(timer)
        }, 2000 / steps)

        setGoldProducts(data.goldProducts || [])
        setRecentProducts(data.recentProducts || [])
      } catch {}
      setLoading(false)
    }
    fetchHomepageData()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    const particles = Array.from({ length: 80 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 3 + 1, speedX: (Math.random() - 0.5) * 0.4, speedY: (Math.random() - 0.5) * 0.4, opacity: Math.random() * 0.3 + 0.05, color: Math.random() > 0.5 ? "#00c853" : "#0a5c36" }))
    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill()
      })
      ctx.globalAlpha = 1; animId = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener("resize", resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  const handle3D = useCallback((e, ref) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -15
    const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 15
    ref.current.style.transform = "perspective(1000px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) scale3d(1.04,1.04,1.04)"
    ref.current.style.boxShadow = (-ry * 2) + "px " + (rx * 2) + "px 60px rgba(0,200,83,0.15)"
  }, [])

  const reset3D = useCallback((ref) => {
    if (!ref.current) return
    ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
    ref.current.style.boxShadow = "0 8px 40px rgba(0,0,0,0.06)"
  }, [])

  const getScoreColor = (score) => score >= 75 ? "#00c853" : score >= 50 ? "#ff8f00" : "#ff3d57"

  return (
    <div style={{ background: "#f8faf8", minHeight: "100vh", paddingTop: "70px", position: "relative", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.5 }}/>

      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0,200,83,0.06) 0%, transparent 70%)", animation: "blob 8s ease-in-out infinite" }}/>
        <div style={{ position: "absolute", bottom: "10%", left: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(10,92,54,0.05) 0%, transparent 70%)", animation: "blob 10s ease-in-out infinite 4s" }}/>
      </div>

      {/* HERO */}
      <section style={{ minHeight: "95vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "100px", padding: "10px 24px", marginBottom: "40px", fontSize: "13px", color: "#0a5c36", fontWeight: "700", letterSpacing: "1px", boxShadow: "0 4px 20px rgba(0,200,83,0.1)", animation: "pulse-green 2s ease-in-out infinite" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00c853", display: "inline-block", boxShadow: "0 0 8px rgba(0,200,83,0.8)" }}/>
          LIVE — 100% BLIND LAB TESTING BY TRUSTIFIED
        </div>
        <h1 style={{ fontSize: "clamp(50px,9vw,108px)", fontWeight: "900", lineHeight: "0.95", letterSpacing: "-4px", color: "#0d1117", marginBottom: "8px" }}>WE TEST IT.</h1>
        <h1 style={{ fontSize: "clamp(50px,9vw,108px)", fontWeight: "900", lineHeight: "0.95", letterSpacing: "-4px", marginBottom: "36px", background: "linear-gradient(135deg,#0a5c36 0%,#00c853 50%,#43a047 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>YOU TRUST IT.</h1>
        <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "#6b7280", maxWidth: "560px", lineHeight: "1.8", marginBottom: "48px" }}>
          Search any health supplement. Get instant independent lab-verified results. No brand influence. No paid promotions. Just the truth.
        </p>
        <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: "580px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "10px", background: "white", border: "2px solid rgba(0,200,83,0.2)", borderRadius: "18px", padding: "8px 8px 8px 22px", boxShadow: "0 8px 40px rgba(0,200,83,0.12)" }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search protein powder, creatine, vitamins..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#0d1117", fontSize: "16px", padding: "8px 0" }}/>
            <button type="submit" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", fontWeight: "900", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap" }}>SEARCH</button>
          </div>
        </form>
        <a href="/scan" style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "white", border: "2px solid rgba(0,200,83,0.2)", borderRadius: "14px", padding: "14px 30px", color: "#0a5c36", textDecoration: "none", fontSize: "15px", fontWeight: "700", marginBottom: "72px" }}>
          📷 SCAN PRODUCT PHOTO
        </a>

        {/* Stats */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", border: "1px solid rgba(0,200,83,0.12)", borderRadius: "24px", overflow: "hidden", background: "white", boxShadow: "0 8px 40px rgba(0,200,83,0.08)", maxWidth: "720px", width: "100%" }}>
          {loading ? (
            // U1 fix — Skeleton loader instead of showing 0
            [1,2,3,4].map(i => (
              <div key={i} style={{ flex: "1", minWidth: "160px", padding: "28px 16px", textAlign: "center", borderRight: i < 4 ? "1px solid rgba(0,200,83,0.08)" : "none" }}>
                <div style={{ height: "40px", width: "80px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "8px", margin: "0 auto 8px" }}/>
                <div style={{ height: "14px", width: "100px", background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "6px", margin: "0 auto" }}/>
              </div>
            ))
          ) : (
            [
              { value: counts.products, suffix: "", label: "Products Tested", color: "#00c853", sub: "Live from database" },
              { value: counts.blind, suffix: "%", label: "Blind Testing", color: "#0a5c36", sub: "No brand samples" },
              { value: counts.params, suffix: "+", label: "Parameters Checked", color: "#43a047", sub: "Per product avg" },
              { value: counts.paid, suffix: "", label: "Paid Promotions", color: "#ff3d57", sub: "Ever. Zero." },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: "1", minWidth: "160px", padding: "28px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(0,200,83,0.08)" : "none", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "3px", background: "linear-gradient(90deg,transparent," + s.color + ",transparent)", borderRadius: "0 0 3px 3px" }}/>
                <div style={{ fontSize: "40px", fontWeight: "900", color: s.color, marginBottom: "4px" }}>{s.value}{s.suffix}</div>
                <div style={{ color: "#0d1117", fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>{s.label}</div>
                <div style={{ color: "#9ca3af", fontSize: "11px" }}>{s.sub}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* GOLD CERTIFIED */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 1, background: "linear-gradient(135deg,#fefce8,#fffbeb)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "100px", padding: "8px 20px", marginBottom: "16px", fontSize: "13px", color: "#92400e", fontWeight: "700" }}>
              🏆 TRUSTIFIED GOLD CERTIFIED
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: "900", letterSpacing: "-1.5px", color: "#0d1117", marginBottom: "12px" }}>Gold Certified Products</h2>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>These products passed every single Trustified lab test with highest standards</p>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: "320px", background: "linear-gradient(90deg,#fef9c3,#fef3c7,#fef9c3)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "20px" }}/>
              ))}
            </div>
          ) : goldProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", background: "white", borderRadius: "20px", border: "1px solid rgba(245,158,11,0.15)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
              <p style={{ fontSize: "16px", fontWeight: "600" }}>Gold certified products will appear here once published by admin</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
              {goldProducts.map(product => (
                <div key={product.id} style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 40px rgba(245,158,11,0.15)", border: "2px solid rgba(245,158,11,0.3)", position: "relative" }}>
                  <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: "800" }}>🏆 GOLD</div>
                  {product.product_image_url ? (
                    <div style={{ height: "180px", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={product.product_image_url} alt={product.name} loading="lazy" style={{ maxHeight: "160px", maxWidth: "100%", objectFit: "contain" }} onError={e => { e.target.parentElement.innerHTML = "<div style='font-size:48px'>💊</div>" }}/>
                    </div>
                  ) : (
                    <div style={{ height: "180px", background: "linear-gradient(135deg,#fef9c3,#fef3c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>💊</div>
                  )}
                  <div style={{ padding: "20px" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>{product.brand}</div>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "8px", lineHeight: "1.3" }}>{product.name}</h3>
                    {product.short_description && <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px", lineHeight: "1.5" }}>{product.short_description}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(product.trust_score) + " " + (product.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: getScoreColor(product.trust_score) }}>{product.trust_score >= 75 ? "SAFE" : "CAUTION"}</span>
                      </div>
                      {product.discounted_price && <div style={{ fontSize: "18px", fontWeight: "900", color: "#0a5c36" }}>₹{product.discounted_price}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={"/product/" + product.id} style={{ flex: 1, display: "block", textAlign: "center", background: "#f8faf8", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", padding: "10px", color: "#0a5c36", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>View Report</a>
                      {product.affiliate_link && <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "block", textAlign: "center", background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "10px", padding: "10px", color: "white", textDecoration: "none", fontSize: "13px", fontWeight: "800" }}>Buy Now →</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RECENT TESTS */}
      {!loading && recentProducts.length > 0 && (
        <section style={{ padding: "80px 24px", position: "relative", zIndex: 1, background: "white" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "12px", fontSize: "12px", color: "#0a5c36", fontWeight: "700" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00c853", display: "inline-block", animation: "pulse-green 2s ease-in-out infinite" }}/>
                  RECENTLY TESTED
                </div>
                <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: "900", letterSpacing: "-1px", color: "#0d1117" }}>Latest Lab Results</h2>
              </div>
              <a href="/rankings" style={{ color: "#0a5c36", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>View All →</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>
              {recentProducts.map(product => (
                <a key={product.id} href={"/product/" + product.id} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#f8faf8", borderRadius: "16px", padding: "18px", border: "1px solid rgba(0,200,83,0.08)", display: "flex", gap: "14px", alignItems: "center", transition: "all 0.2s ease" }}>
                    {product.product_image_url ? (
                      <img src={product.product_image_url} alt={product.name} loading="lazy" style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "contain", background: "white", border: "1px solid rgba(0,200,83,0.1)", flexShrink: 0 }} onError={e => e.target.style.display = "none"}/>
                    ) : (
                      <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "white", border: "1px solid rgba(0,200,83,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>💊</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.brand}</div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#0d1117", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "900", color: getScoreColor(product.trust_score) }}>{product.trust_score}/100</span>
                        {product.discounted_price && <span style={{ fontSize: "12px", fontWeight: "700", color: "#0a5c36" }}>₹{product.discounted_price}</span>}
                      </div>
                    </div>
                    {product.affiliate_link && (
                      <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ flexShrink: 0, background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", textDecoration: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "800" }}>Buy</a>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-block", background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", padding: "6px 18px", fontSize: "11px", color: "#0a5c36", fontWeight: "800", letterSpacing: "3px", marginBottom: "20px" }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: "900", letterSpacing: "-1.5px", marginBottom: "12px", color: "#0d1117" }}>Three Steps to <span style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>The Truth</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "24px" }}>
          {[
            { step: "01", color: "#00c853", rgb: "0,200,83", title: "Scan or Search", desc: "Scan barcode, photograph the product, or type the name. Our AI instantly reads product details from any photo.", icon: "📷" },
            { step: "02", color: "#0a5c36", rgb: "10,92,54", title: "Database Check", desc: "System instantly searches Trustified verified lab database. Only independently tested products appear.", icon: "🔬" },
            { step: "03", color: "#43a047", rgb: "67,160,71", title: "Full Lab Report", desc: "Complete lab results, trust score, composition analysis, safety parameters and educational breakdown.", icon: "📋" },
          ].map((item, i) => (
            <div key={item.step} ref={cardRefs[i]} onMouseMove={e => handle3D(e, cardRefs[i])} onMouseLeave={() => reset3D(cardRefs[i])} style={{ background: "white", border: "1px solid rgba(" + item.rgb + ",0.2)", borderRadius: "28px", padding: "40px 32px", position: "relative", overflow: "hidden", cursor: "default", transformStyle: "preserve-3d", transition: "transform 0.15s ease", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "3px", background: "linear-gradient(90deg,transparent," + item.color + ",transparent)" }}/>
              <div style={{ position: "absolute", bottom: "-20px", right: "10px", fontSize: "120px", fontWeight: "900", color: "rgba(" + item.rgb + ",0.04)", lineHeight: "1", userSelect: "none" }}>{item.step}</div>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>{item.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: item.color, marginBottom: "10px", letterSpacing: "3px" }}>STEP {item.step}</div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "12px", color: "#0d1117", letterSpacing: "-0.5px" }}>{item.title}</h3>
              <p style={{ color: "#6b7280", lineHeight: "1.8", fontSize: "14px" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", zIndex: 1, background: "linear-gradient(135deg,#0a5c36,#00c853)" }}>
        <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: "900", letterSpacing: "-1.5px", color: "white", marginBottom: "16px" }}>Ready to Know What is In Your Supplements?</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", marginBottom: "40px" }}>Search any product. Free forever. No account needed.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/search" style={{ display: "inline-block", background: "white", color: "#0a5c36", textDecoration: "none", padding: "18px 48px", borderRadius: "14px", fontSize: "17px", fontWeight: "900" }}>Search Products</a>
          <a href="/scan" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", color: "white", textDecoration: "none", padding: "18px 48px", borderRadius: "14px", fontSize: "17px", fontWeight: "700", border: "2px solid rgba(255,255,255,0.3)" }}>Scan Product</a>
        </div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "40px" }}>
          All lab results independently verified by Trustified.{" "}
          <a href="https://docs.google.com/document/d/13cUREmyWGS-WZGJOifQZBWhCv_nr3flh/edit" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)" }}>Read disclaimer</a>
        </p>
      </section>

      <style jsx global>{`
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.35)}50%{box-shadow:0 0 0 8px rgba(0,200,83,0)} }
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  )
}