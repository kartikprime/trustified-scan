"use client"
import { useState, useEffect } from "react"

export default function RequestPage() {
  const [form, setForm] = useState({ product_name: "", brand: "" })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [requests, setRequests] = useState([])

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try { const res = await fetch("/api/request"); const data = await res.json(); setRequests(data.requests || []) }
    catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) { setSubmitted(true); fetchRequests() }
      else setError(data.error || "Something went wrong")
    } catch { setError("Something went wrong. Please try again.") }
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Request a Product Test</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>Tell Trustified which product you want tested next. Your request goes directly to the team.</p>
      </div>

      <div style={{ maxWidth: "700px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        {submitted ? (
          <div style={{ background: "white", borderRadius: "20px", padding: "48px", textAlign: "center", border: "1px solid rgba(0,200,83,0.15)", boxShadow: "0 8px 40px rgba(0,200,83,0.1)" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0d1117", marginBottom: "10px" }}>Request Submitted!</h2>
            <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "24px", lineHeight: "1.7" }}>Your request has been sent to the Trustified team. They will consider it for their next testing batch.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => { setSubmitted(false); setForm({ product_name: "", brand: "" }) }} style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>Request Another</button>
              <a href="https://www.youtube.com/@Trustified-Certification" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", color: "#c62828", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>Watch on YouTube</a>
            </div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", border: "1px solid rgba(0,200,83,0.1)", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "6px" }}>Submit Your Request</h2>
            <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "24px" }}>AI will validate your request before submitting to ensure it is a real food product</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Product Name *</label>
                  <input value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} placeholder="e.g. Maggi Masala Noodles" style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", fontSize: "15px", color: "#0d1117", outline: "none", fontFamily: "inherit" }} required/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Brand Name</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Nestle" style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", fontSize: "15px", color: "#0d1117", outline: "none", fontFamily: "inherit" }}/>
                </div>
              </div>
              {error && <div style={{ background: "rgba(255,61,87,0.08)", border: "1px solid rgba(255,61,87,0.2)", borderRadius: "10px", padding: "12px 16px", color: "#c62828", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {loading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }}/> Validating with AI...</> : "Submit Request"}
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </button>
            </form>
          </div>
        )}

        {requests.length > 0 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>Recent Requests from Community</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {requests.map((req, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8faf8", borderRadius: "10px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0d1117" }}>{req.product_name}</div>
                    {req.brand && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{req.brand}</div>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}