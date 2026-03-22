"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"

const getCategoryLabel = (val) => {
  if (!val) return ""
  return val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

const getScoreColor = (score) => {
  if (score >= 75) return "#00c853"
  if (score >= 50) return "#ff8f00"
  return "#ff3d57"
}

const getScoreLabel = (score) => {
  if (score >= 75) return "SAFE"
  if (score >= 50) return "CAUTION"
  return "UNSAFE"
}

const getStatusColor = (status) => {
  if (!status) return "#9ca3af"
  const s = status.toLowerCase()
  if (s === "safe" || s === "accurate") return "#00c853"
  if (s === "borderline" || s === "mismatch" || s === "not_tested") return "#ff8f00"
  return "#ff3d57"
}

// Visual circle component for macro comparison
function MacroCircle({ label, labelClaim, labResult, unit = "g" }) {
  const labelVal = parseFloat(labelClaim) || 0
  const labVal = parseFloat(labResult) || 0
  const diff = labelVal > 0 ? ((labVal - labelVal) / labelVal * 100).toFixed(1) : 0
  const isAccurate = Math.abs(diff) <= 5
  const color = isAccurate ? "#00c853" : Math.abs(diff) <= 15 ? "#ff8f00" : "#ff3d57"

  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: "120px" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
        {/* Label claim circle */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#9ca3af" }}>{labelClaim || "N/A"}</span>
            <span style={{ fontSize: "9px", color: "#9ca3af", fontWeight: "600" }}>{unit}</span>
          </div>
          <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "6px", fontWeight: "600" }}>LABEL</div>
        </div>
        <div style={{ fontSize: "16px", color: "#d1d5db" }}>→</div>
        {/* Lab result circle */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid " + color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: color + "10", boxShadow: "0 2px 12px " + color + "30" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: color }}>{labResult || "N/A"}</span>
            <span style={{ fontSize: "9px", color: color, fontWeight: "600" }}>{unit}</span>
          </div>
          <div style={{ fontSize: "10px", color: color, marginTop: "6px", fontWeight: "700" }}>LAB</div>
        </div>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: color + "15", border: "1px solid " + color + "30", borderRadius: "100px", padding: "3px 10px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }}/>
        <span style={{ fontSize: "11px", fontWeight: "700", color: color }}>{isAccurate ? "Accurate" : Math.abs(diff) <= 15 ? "Borderline" : "Mismatch"}</span>
      </div>
    </div>
  )
}

// Status badge component
function StatusBadge({ status, large = false }) {
  const color = getStatusColor(status)
  const size = large ? { padding: "8px 20px", fontSize: "14px" } : { padding: "4px 12px", fontSize: "11px" }
  return (
    <span style={{ ...size, borderRadius: "100px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", background: color + "15", color: color, border: "1px solid " + color + "30", display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }}/>
      {status}
    </span>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/product/" + id)
        if (!res.ok) { setNotFound(true); return }
        const json = await res.json()
        if (json.error) { setNotFound(true); return }
        setData(json)
      } catch { setNotFound(true) }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: data?.product?.name + " — Trustified Scan", text: "Check the lab test result for " + data?.product?.name, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", border: "4px solid rgba(0,200,83,0.15)", borderTop: "4px solid #00c853", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 1s linear infinite" }}/>
        <p style={{ color: "#6b7280", fontSize: "16px", fontWeight: "600" }}>Loading lab report...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "72px", marginBottom: "20px" }}>🔬</div>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0d1117", marginBottom: "12px" }}>Product Not Found</h1>
        <p style={{ color: "#9ca3af", fontSize: "16px", maxWidth: "400px", margin: "0 auto 32px" }}>This product has not been tested by Trustified yet or may have been removed.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/search")} style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Search Products</button>
          <button onClick={() => router.push("/request")} style={{ background: "white", color: "#0a5c36", border: "1px solid rgba(0,200,83,0.3)", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Request This Test</button>
        </div>
      </div>
    </div>
  )

  const { product, composition, safety, similar } = data

  // Separate composition by type
  const macros = composition.filter(c => c.parameter_type === "macro" || ["protein","fat","carb","calorie","sodium","sugar","fiber","moisture"].some(k => c.parameter_name?.toLowerCase().includes(k)))
  const aminoAcids = composition.filter(c => c.parameter_type === "amino_acid" || ["alanine","arginine","aspartic","cysteine","glutamic","glycine","histidine","isoleucine","leucine","lysine","methionine","phenylalanine","proline","serine","threonine","tyrosine","valine","tryptophan"].some(k => c.parameter_name?.toLowerCase().includes(k)))
  const generalComp = composition.filter(c => !macros.includes(c) && !aminoAcids.includes(c))

  // Separate safety by type
  const aminoSpikingParams = safety.filter(s => s.parameter_name?.toLowerCase().includes("spiking") || s.parameter_name?.toLowerCase().includes("creatine") || s.parameter_name?.toLowerCase().includes("taurine") || s.parameter_name?.toLowerCase().includes("glycine") || s.parameter_name?.toLowerCase().includes("sarcosine"))
  const melamineParm = safety.filter(s => s.parameter_name?.toLowerCase().includes("melamine"))
  const npnParam = safety.filter(s => s.parameter_name?.toLowerCase().includes("non protein") || s.parameter_name?.toLowerCase().includes("npn"))
  const heavyMetals = safety.filter(s => s.parameter_name?.toLowerCase().includes("heavy") || s.parameter_name?.toLowerCase().includes("lead") || s.parameter_name?.toLowerCase().includes("cadmium") || s.parameter_name?.toLowerCase().includes("arsenic") || s.parameter_name?.toLowerCase().includes("mercury"))
  const otherSafety = safety.filter(s => !aminoSpikingParams.includes(s) && !melamineParm.includes(s) && !npnParam.includes(s) && !heavyMetals.includes(s))

  const allSafe = safety.every(s => s.status === "safe")
  const hasUnsafe = safety.some(s => s.status === "unsafe")
  const noAminoSpiking = aminoSpikingParams.every(s => s.status === "safe")
  const noMelamine = melamineParm.every(s => s.status === "safe")

  const scoreColor = getScoreColor(product.trust_score)

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .product-card:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,200,83,0.15)!important}
      `}</style>

      {/* ===== HERO SECTION ===== */}
      <div style={{ background: "linear-gradient(135deg,#0a5c36 0%,#1a7a4a 50%,#00c853 100%)", padding: "40px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-5%", width: "400px", height: "400px", background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: "-30%", left: "-5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.03)", borderRadius: "50%", pointerEvents: "none" }}/>

        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</a>
            <span>›</span>
            <a href="/search" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Products</a>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>{product.name}</span>
          </div>

          <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Product Image */}
            <div style={{ flexShrink: 0 }}>
              {product.product_image_url ? (
                <div style={{ width: "160px", height: "160px", background: "white", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", overflow: "hidden", padding: "8px" }}>
                  <img src={product.product_image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => { e.target.parentElement.innerHTML = "<div style='font-size:56px'>💊</div>" }}/>
                </div>
              ) : (
                <div style={{ width: "160px", height: "160px", background: "rgba(255,255,255,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", border: "2px solid rgba(255,255,255,0.2)" }}>💊</div>
              )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                {product.is_gold_certified && (
                  <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "11px", fontWeight: "800", padding: "4px 12px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "4px" }}>🏆 GOLD CERTIFIED</span>
                )}
                <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "100px", fontFamily: "monospace" }}>{product.product_code}</span>
                <span style={{ background: product.testing_status === "passed" ? "rgba(0,200,83,0.3)" : "rgba(255,61,87,0.3)", color: "white", fontSize: "11px", fontWeight: "800", padding: "4px 12px", borderRadius: "100px" }}>
                  {product.testing_status === "passed" ? "✅ PASSED" : product.testing_status === "failed" ? "❌ FAILED" : "⚠️ PARTIAL PASS"}
                </span>
              </div>

              <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: "900", color: "white", lineHeight: "1.2", marginBottom: "6px", letterSpacing: "-0.5px" }}>{product.name}</h1>
              <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "16px", fontWeight: "600" }}>by {product.brand} · {getCategoryLabel(product.category)}</div>

              {product.short_description && (
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginBottom: "16px", lineHeight: "1.6", maxWidth: "500px" }}>{product.short_description}</p>
              )}

              {/* Meta Info Row */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
                {product.batch_number && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ fontWeight: "700", color: "rgba(255,255,255,0.9)" }}>Batch:</span> {product.batch_number}
                  </div>
                )}
                {product.test_date && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ fontWeight: "700", color: "rgba(255,255,255,0.9)" }}>Tested:</span> {new Date(product.test_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
                {product.expiry_date && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ fontWeight: "700", color: "rgba(255,255,255,0.9)" }}>Expiry:</span> {new Date(product.expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
                {product.published_date && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ fontWeight: "700", color: "rgba(255,255,255,0.9)" }}>Published:</span> {new Date(product.published_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {product.affiliate_link && (
                  <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "white", color: "#0a5c36", textDecoration: "none", padding: "12px 24px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                    🛒 {product.discounted_price ? "Buy ₹" + product.discounted_price : "Buy Now"}
                    {product.price && product.discounted_price && product.price !== product.discounted_price && (
                      <span style={{ fontSize: "12px", color: "#9ca3af", textDecoration: "line-through", fontWeight: "400" }}>₹{product.price}</span>
                    )}
                  </a>
                )}
                {product.youtube_url && (
                  <a href={product.youtube_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,0,0,0.2)", color: "white", textDecoration: "none", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", border: "1px solid rgba(255,0,0,0.3)" }}>
                    ▶ Watch Test Video
                  </a>
                )}
                {product.lab_report_url && (
                  <a href={product.lab_report_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", color: "white", textDecoration: "none", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", border: "1px solid rgba(255,255,255,0.2)" }}>
                    📄 Lab Report
                  </a>
                )}
                <button onClick={handleShare} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                  {copied ? "✓ Copied!" : "🔗 Share"}
                </button>
                <a href={"/compare?p=" + id} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", color: "white", textDecoration: "none", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", border: "1px solid rgba(255,255,255,0.2)" }}>
                  ⚖️ Compare
                </a>
              </div>
            </div>

            {/* Trust Score */}
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <div style={{ width: "140px", height: "140px", borderRadius: "50%", background: "conic-gradient(" + scoreColor + " " + (product.trust_score * 3.6) + "deg, rgba(255,255,255,0.15) 0deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ width: "110px", height: "110px", borderRadius: "50%", background: "rgba(10,92,54,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "38px", fontWeight: "900", color: scoreColor, lineHeight: "1" }}>{product.trust_score}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: "600" }}>/ 100</span>
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: scoreColor }}>{getScoreLabel(product.trust_score)}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: "600" }}>TRUST SCORE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== QUICK SUMMARY CARDS ===== */}
      <div style={{ maxWidth: "1100px", margin: "-32px auto 0", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px", marginBottom: "32px" }}>
          {[
            {
              icon: aminoSpikingParams.length > 0 ? (noAminoSpiking ? "✅" : "❌") : "⚪",
              label: "Amino Spiking",
              value: aminoSpikingParams.length > 0 ? (noAminoSpiking ? "Not Found" : "DETECTED") : "Not Tested",
              color: aminoSpikingParams.length > 0 ? (noAminoSpiking ? "#00c853" : "#ff3d57") : "#9ca3af",
            },
            {
              icon: melamineParm.length > 0 ? (noMelamine ? "✅" : "❌") : "⚪",
              label: "Melamine",
              value: melamineParm.length > 0 ? (noMelamine ? "Not Found" : "DETECTED") : "Not Tested",
              color: melamineParm.length > 0 ? (noMelamine ? "#00c853" : "#ff3d57") : "#9ca3af",
            },
            {
              icon: heavyMetals.length > 0 ? (heavyMetals.every(h => h.status === "safe") ? "✅" : "⚠️") : "⚪",
              label: "Heavy Metals",
              value: heavyMetals.length > 0 ? (heavyMetals.every(h => h.status === "safe") ? "Within Limits" : "Check Report") : "Not Tested",
              color: heavyMetals.length > 0 ? (heavyMetals.every(h => h.status === "safe") ? "#00c853" : "#ff8f00") : "#9ca3af",
            },
            {
              icon: composition.length > 0 ? (composition.every(c => c.status === "accurate") ? "✅" : "⚠️") : "⚪",
              label: "Label Accuracy",
              value: composition.length > 0 ? (composition.every(c => c.status === "accurate") ? "100% Accurate" : composition.filter(c => c.status === "mismatch").length + " Mismatch") : "Not Tested",
              color: composition.length > 0 ? (composition.every(c => c.status === "accurate") ? "#00c853" : "#ff8f00") : "#9ca3af",
            },
          ].map(card => (
            <div key={card.label} style={{ background: "white", borderRadius: "16px", padding: "18px 20px", border: "1px solid rgba(0,200,83,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>{card.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: "900", color: card.color, marginBottom: "2px" }}>{card.value}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* ===== TABS ===== */}
        <div style={{ display: "flex", gap: "4px", background: "white", padding: "6px", borderRadius: "16px", border: "1px solid rgba(0,200,83,0.1)", marginBottom: "24px", overflowX: "auto" }}>
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "macro", label: "🥩 Macro Accuracy" },
            { id: "amino", label: "🧬 Amino Profile" },
            { id: "safety", label: "🛡️ Safety Tests" },
            { id: "education", label: "📚 What This Means" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "10px 18px", borderRadius: "12px", border: "none", background: activeTab === tab.id ? "linear-gradient(135deg,#0a5c36,#00c853)" : "transparent", color: activeTab === tab.id ? "white" : "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Overall Status Banner */}
            <div style={{ background: allSafe ? "linear-gradient(135deg,rgba(0,200,83,0.08),rgba(10,92,54,0.04))" : hasUnsafe ? "linear-gradient(135deg,rgba(255,61,87,0.08),rgba(198,40,40,0.04))" : "linear-gradient(135deg,rgba(255,143,0,0.08),rgba(230,81,0,0.04))", border: "1px solid " + (allSafe ? "rgba(0,200,83,0.2)" : hasUnsafe ? "rgba(255,61,87,0.2)" : "rgba(255,143,0,0.2)"), borderRadius: "16px", padding: "20px 24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ fontSize: "40px" }}>{allSafe ? "✅" : hasUnsafe ? "❌" : "⚠️"}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: allSafe ? "#0a5c36" : hasUnsafe ? "#c62828" : "#e65100", marginBottom: "4px" }}>
                  {allSafe ? "All Tests Passed — Product is Safe" : hasUnsafe ? "Issues Found — Review Required" : "Some Parameters Need Attention"}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
                  Tested by Trustified Independent Lab · {safety.length} safety parameters · {composition.length} composition parameters checked
                </div>
              </div>
            </div>

            {/* Full Composition Table */}
            {composition.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>🧪 Complete Composition Analysis</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8faf8" }}>
                        {["Parameter","Label Claim","Lab Result","LOQ","Unit","Status"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#6b7280", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,200,83,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {composition.map((row, i) => (
                        <tr key={row.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                          <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "700", color: "#0d1117" }}>
                            {row.parameter_name}
                            {row.parameter_type && row.parameter_type !== "general" && (
                              <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: "700", color: "#9ca3af", background: "#f3f4f6", borderRadius: "4px", padding: "2px 5px", textTransform: "uppercase" }}>{row.parameter_type.replace("_", " ")}</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", color: "#6b7280" }}>{row.label_claim || "—"}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: "700", color: row.lab_result === "NOT_IN_REPORT" ? "#ff8f00" : "#0d1117" }}>{row.lab_result}</td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#9ca3af" }}>{row.loq || "—"}</td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#9ca3af" }}>{row.unit || "—"}</td>
                          <td style={{ padding: "12px 14px" }}><StatusBadge status={row.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Safety Overview */}
            {safety.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>🛡️ Safety Parameters Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "10px" }}>
                  {safety.map(param => (
                    <div key={param.id} style={{ background: "#f8faf8", borderRadius: "12px", padding: "14px 16px", borderLeft: "3px solid " + getStatusColor(param.status) }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0d1117" }}>{param.parameter_name}</span>
                        <StatusBadge status={param.status}/>
                      </div>
                      <div style={{ fontSize: "12px", color: param.result === "NOT_IN_REPORT" ? "#ff8f00" : "#6b7280" }}>
                        {param.result === "NOT_IN_REPORT" ? "Not tested in this report" : param.result}
                      </div>
                      {param.safe_limit && <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Limit: {param.safe_limit}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MACRO ACCURACY TAB ===== */}
        {activeTab === "macro" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "white", borderRadius: "20px", padding: "32px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>Macro Accuracy Analysis</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "32px" }}>Comparing what the label claims vs what the lab actually found</p>

              {macros.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔬</div>
                  <p>No macro data available for this product</p>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
                  {macros.slice(0, 6).map(comp => (
                    <MacroCircle
                      key={comp.id}
                      label={comp.parameter_name}
                      labelClaim={comp.label_claim}
                      labResult={comp.lab_result}
                      unit={comp.unit || "g"}
                    />
                  ))}
                </div>
              )}

              {/* Explanation */}
              <div style={{ background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.12)", borderRadius: "12px", padding: "16px 20px" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0a5c36", marginBottom: "8px" }}>How to read this</div>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #e5e7eb", background: "white" }}/>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Grey circle = what label claims</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #00c853", background: "rgba(0,200,83,0.1)" }}/>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Green circle = what lab found (accurate)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #ff3d57", background: "rgba(255,61,87,0.1)" }}/>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Red circle = significant mismatch found</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full macro table */}
            {macros.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>Detailed Macro Data</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#f8faf8" }}>{["Parameter","Label Claim","Lab Result","LOQ","Unit","Verdict"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#6b7280", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,200,83,0.08)", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {macros.map((row, i) => (
                        <tr key={row.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                          <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "700" }}>{row.parameter_name}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", color: "#6b7280" }}>{row.label_claim || "—"}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: "700" }}>{row.lab_result}</td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#9ca3af" }}>{row.loq || "—"}</td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: "#9ca3af" }}>{row.unit || "—"}</td>
                          <td style={{ padding: "12px 14px" }}><StatusBadge status={row.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== AMINO PROFILE TAB ===== */}
        {activeTab === "amino" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Amino Spiking Status Banner */}
            <div style={{ background: aminoSpikingParams.length === 0 ? "rgba(156,163,175,0.1)" : noAminoSpiking ? "rgba(0,200,83,0.06)" : "rgba(255,61,87,0.06)", border: "1px solid " + (aminoSpikingParams.length === 0 ? "rgba(156,163,175,0.2)" : noAminoSpiking ? "rgba(0,200,83,0.2)" : "rgba(255,61,87,0.2)"), borderRadius: "16px", padding: "20px 24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ fontSize: "36px" }}>{aminoSpikingParams.length === 0 ? "⚪" : noAminoSpiking ? "✅" : "❌"}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: aminoSpikingParams.length === 0 ? "#6b7280" : noAminoSpiking ? "#0a5c36" : "#c62828", marginBottom: "4px" }}>
                  Amino Spiking Status: {aminoSpikingParams.length === 0 ? "Not Tested" : noAminoSpiking ? "No Amino Spiking Found" : "Amino Spiking Detected"}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Amino spiking means adding cheap amino acids to artificially inflate protein readings on labels.
                </div>
              </div>
            </div>

            {/* Amino Acid Profile Table */}
            {aminoAcids.length > 0 ? (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0d1117", marginBottom: "6px" }}>Complete Amino Acid Profile</h3>
                <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "16px" }}>Full amino acid breakdown from lab testing · Values in g/100g</p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8faf8" }}>
                        {["Amino Acid","Lab Result","LOQ","Unit","Status"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#6b7280", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,200,83,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aminoAcids.map((row, i) => (
                        <tr key={row.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                          <td style={{ padding: "10px 14px", fontSize: "14px", fontWeight: "700", color: "#0d1117" }}>{row.parameter_name}</td>
                          <td style={{ padding: "10px 14px", fontSize: "14px", fontWeight: "700", color: "#0d1117" }}>{row.lab_result}</td>
                          <td style={{ padding: "10px 14px", fontSize: "13px", color: "#9ca3af" }}>{row.loq || "0.01"}</td>
                          <td style={{ padding: "10px 14px", fontSize: "13px", color: "#9ca3af" }}>{row.unit || "g/100g"}</td>
                          <td style={{ padding: "10px 14px" }}><StatusBadge status={row.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧬</div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>No Amino Acid Profile Data</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>Amino acid profile data was not available in the lab report for this product.</p>
              </div>
            )}

            {/* Melamine + NPN */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>Melamine Spiking</h4>
                {melamineParm.length > 0 ? melamineParm.map(p => (
                  <div key={p.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "24px" }}>{p.status === "safe" ? "✅" : "❌"}</span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: p.status === "safe" ? "#0a5c36" : "#c62828" }}>{p.status === "safe" ? "No Melamine Found" : "Melamine Detected"}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>Result: {p.result}</div>
                    {p.safe_limit && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Limit: {p.safe_limit}</div>}
                  </div>
                )) : <p style={{ color: "#9ca3af", fontSize: "13px" }}>Not tested in this report</p>}
              </div>

              <div style={{ background: "white", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", marginBottom: "12px" }}>Non Protein Nitrogen</h4>
                {npnParam.length > 0 ? npnParam.map(p => (
                  <div key={p.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "24px" }}>{p.status === "safe" ? "✅" : "❌"}</span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: p.status === "safe" ? "#0a5c36" : "#c62828" }}>{p.result || (p.status === "safe" ? "BLD" : "Detected")}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>Non-protein nitrogen indicates adulteration</div>
                    {p.safe_limit && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Limit: {p.safe_limit}</div>}
                  </div>
                )) : <p style={{ color: "#9ca3af", fontSize: "13px" }}>Not tested in this report</p>}
              </div>
            </div>
          </div>
        )}

        {/* ===== SAFETY TAB ===== */}
        {activeTab === "safety" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Heavy Metals Section */}
            {heavyMetals.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0d1117", marginBottom: "6px" }}>⚗️ Heavy Metals Testing</h3>
                <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "16px" }}>Tested against international safety limits</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "10px" }}>
                  {heavyMetals.map(param => (
                    <div key={param.id} style={{ background: "#f8faf8", borderRadius: "12px", padding: "16px", border: "1px solid rgba(0,200,83,0.06)", display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: getStatusColor(param.status) + "15", border: "2px solid " + getStatusColor(param.status) + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                        {param.status === "safe" ? "✅" : param.status === "borderline" ? "⚠️" : "❌"}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#0d1117" }}>{param.parameter_name.replace("Heavy Metals - ", "")}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{param.result || "Not detected"}</div>
                        {param.safe_limit && <div style={{ fontSize: "11px", color: "#9ca3af" }}>Limit: {param.safe_limit}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Safety */}
            {otherSafety.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>🔬 Other Safety Tests</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {otherSafety.map(param => (
                    <div key={param.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f8faf8", borderRadius: "12px", borderLeft: "3px solid " + getStatusColor(param.status), flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0d1117", marginBottom: "2px" }}>{param.parameter_name}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{param.result === "NOT_IN_REPORT" ? "Not tested" : param.result}{param.safe_limit && " · Limit: " + param.safe_limit}</div>
                        {param.details && <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{param.details}</div>}
                      </div>
                      <StatusBadge status={param.status}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {safety.length === 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛡️</div>
                <p style={{ color: "#9ca3af", fontSize: "15px" }}>No safety parameter data available for this product.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== EDUCATION TAB ===== */}
        {activeTab === "education" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  icon: "⭐",
                  title: "What is the Trust Score?",
                  content: "The Trust Score is calculated by Trustified based on three factors: label accuracy (30%) — how closely the lab results match what is printed on the product label; safety compliance (40%) — whether all safety parameters are within permissible limits; and test completeness (30%) — how many required parameters were tested. A score above 75 means the product is safe and honest. 50-75 means some concerns exist. Below 50 means significant issues were found.",
                  color: "#00c853",
                },
                {
                  icon: "🔬",
                  title: "What is Blind Testing?",
                  content: "Trustified purchases products directly from the market — no samples from brands. This ensures the test represents exactly what a consumer would buy. Brands have no prior knowledge of which product is being tested or when. This is the most honest form of product testing.",
                  color: "#0a5c36",
                },
                {
                  icon: "🧬",
                  title: "What is Amino Spiking?",
                  content: "Some manufacturers add cheap amino acids like glycine, taurine, or creatine to their protein powders. These amino acids show up as protein in basic tests, making the protein content appear higher than it actually is. Trustified specifically tests for amino spiking using advanced amino acid profiling to catch this practice.",
                  color: "#6366f1",
                },
                {
                  icon: "⚗️",
                  title: "Why Test for Heavy Metals?",
                  content: "Heavy metals like lead, arsenic, cadmium, and mercury can be present in protein powders due to contaminated raw materials or poor manufacturing. Long-term exposure to these metals causes serious health problems. Trustified tests every product against international safety limits to ensure you are not consuming toxic levels.",
                  color: "#ec4899",
                },
                {
                  icon: "📋",
                  title: "What Does Label Mismatch Mean?",
                  content: "Label mismatch occurs when what is printed on the product packaging is significantly different from what the lab test found. For example, if a protein powder claims 25g protein per serving but the lab finds only 20g — that is a mismatch. Trustified compares label claims against actual lab results to hold brands accountable.",
                  color: "#f59e0b",
                },
              ].map(item => (
                <div key={item.title} style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid rgba(0,200,83,0.08)", display: "flex", gap: "16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: item.color + "12", border: "1px solid " + item.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>{item.title}</h4>
                    <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.8" }}>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SIMILAR PRODUCTS ===== */}
        {similar.length > 0 && (
          <div style={{ marginTop: "32px", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>
              Similar Products You Might Like
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "16px" }}>
              {similar.map(p => (
                <a key={p.id} href={"/product/" + p.id} className="product-card" style={{ textDecoration: "none", background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,200,83,0.1)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.25s ease", display: "block" }}>
                  {p.product_image_url ? (
                    <div style={{ height: "140px", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}>
                      <img src={p.product_image_url} alt={p.name} style={{ maxHeight: "120px", maxWidth: "100%", objectFit: "contain" }} onError={e => { e.target.parentElement.innerHTML = "<div style='font-size:40px'>💊</div>" }}/>
                    </div>
                  ) : (
                    <div style={{ height: "140px", background: "linear-gradient(135deg,rgba(0,200,83,0.06),rgba(10,92,54,0.03))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>💊</div>
                  )}
                  <div style={{ padding: "16px" }}>
                    <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", marginBottom: "3px" }}>{p.brand}</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0d1117", marginBottom: "10px", lineHeight: "1.3" }}>{p.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "conic-gradient(" + getScoreColor(p.trust_score) + " " + (p.trust_score * 3.6) + "deg, #f3f4f6 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "10px", fontWeight: "900", color: getScoreColor(p.trust_score) }}>{p.trust_score}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: getScoreColor(p.trust_score) }}>{getScoreLabel(p.trust_score)}</span>
                      </div>
                      {p.discounted_price && <span style={{ fontSize: "14px", fontWeight: "900", color: "#0a5c36" }}>₹{p.discounted_price}</span>}
                    </div>
                    {p.affiliate_link && (
                      <a href={p.affiliate_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", textDecoration: "none", padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", marginTop: "10px" }}>
                        Buy Now →
                      </a>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}