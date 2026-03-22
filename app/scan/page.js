"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const [mode, setMode] = useState("choice")
  const [scanning, setScanning] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(null)
  const [detected, setDetected] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startCamera = async () => {
    setError("")
    setMode("camera")
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
    } catch {
      setError("Camera access denied. Please allow camera permission and try again.")
      setScanning(false); setMode("choice")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setScanning(false); setMode("choice"); setPreview(null); setDetected(null); setError("")
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    const imageData = canvas.toDataURL("image/jpeg", 0.9)
    setPreview(imageData)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setScanning(false)
    analyzeImage(imageData)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setPreview(ev.target.result); setMode("preview"); analyzeImage(ev.target.result) }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (imageData) => {
    setAnalyzing(true); setError(""); setDetected(null)
    try {
      const res = await fetch("/api/scan/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      })
      const data = await res.json()
      if (data.success) { setDetected(data); setMode("detected") }
      else { setError(data.error || "Could not read product. Please try a clearer photo."); setMode("preview") }
    } catch { setError("Something went wrong. Please try again."); setMode("preview") }
    setAnalyzing(false)
  }

  const searchDetected = () => {
    if (detected) router.push("/search?q=" + encodeURIComponent(detected.productName + " " + detected.brandName))
  }

  const handleBarcodeSearch = (e) => {
    e.preventDefault()
    const barcode = e.target.barcode.value.trim()
    if (barcode) router.push("/search?q=" + encodeURIComponent(barcode))
  }

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", pointerEvents: "none" }}/>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Scan a Product</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", maxWidth: "480px", margin: "0 auto" }}>
          Take a photo of any packaged food product. AI instantly reads product details and searches the Trustified database.
        </p>
      </div>

      <div style={{ maxWidth: "700px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        {error && <div style={{ background: "rgba(255,61,87,0.08)", border: "1px solid rgba(255,61,87,0.2)", borderRadius: "12px", padding: "14px 18px", color: "#c62828", fontSize: "14px", fontWeight: "600", marginBottom: "16px", marginTop: "16px" }}>{error}</div>}

        {mode === "choice" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px", marginTop: "8px" }}>
              <button onClick={startCamera} style={{ background: "white", border: "2px solid rgba(0,200,83,0.2)", borderRadius: "20px", padding: "36px 24px", cursor: "pointer", textAlign: "center", boxShadow: "0 8px 40px rgba(0,200,83,0.1)" }}>
                <div style={{ fontSize: "40px", marginBottom: "14px" }}>📷</div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>Open Camera</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>Point camera at product. AI reads name and brand automatically.</p>
              </button>
              <button onClick={() => fileRef.current.click()} style={{ background: "white", border: "2px solid rgba(0,200,83,0.2)", borderRadius: "20px", padding: "36px 24px", cursor: "pointer", textAlign: "center", boxShadow: "0 8px 40px rgba(0,200,83,0.1)" }}>
                <div style={{ fontSize: "40px", marginBottom: "14px" }}>🖼️</div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>Upload Photo</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>Upload from gallery. Works best with clear front-facing product shots.</p>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }}/>

            <div style={{ background: "white", borderRadius: "20px", padding: "28px 24px", marginTop: "16px", border: "1px solid rgba(0,200,83,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "6px" }}>Search by Barcode Number</h3>
              <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "16px" }}>Type the barcode number printed on the product</p>
              <form onSubmit={handleBarcodeSearch} style={{ display: "flex", gap: "10px" }}>
                <input name="barcode" type="text" placeholder="e.g. 8901491100013" style={{ flex: 1, padding: "12px 16px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", fontSize: "14px", color: "#0d1117", outline: "none", fontFamily: "inherit" }}/>
                <button type="submit" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap" }}>Search</button>
              </form>
            </div>

            <div style={{ background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.12)", borderRadius: "16px", padding: "20px 24px", marginTop: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0a5c36", marginBottom: "10px" }}>Tips for best results</h4>
              {["Point camera at the front of the product packaging","Make sure product name and brand are clearly visible","Good lighting gives better AI reading accuracy","Works best on packaged food products with clear labels"].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ color: "#00c853", fontWeight: "800", fontSize: "14px", flexShrink: 0 }}>✓</span>
                  <span style={{ color: "#6b7280", fontSize: "13px" }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "camera" && (
          <div style={{ marginTop: "8px" }}>
            <div style={{ background: "black", borderRadius: "20px", overflow: "hidden", position: "relative", aspectRatio: "16/9" }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              <canvas ref={canvasRef} style={{ display: "none" }}/>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "70%", height: "60%", border: "2px solid rgba(0,200,83,0.8)", borderRadius: "12px", pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "20px", height: "20px", borderTop: "3px solid #00c853", borderLeft: "3px solid #00c853", borderRadius: "4px 0 0 0" }}/>
                <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "20px", height: "20px", borderTop: "3px solid #00c853", borderRight: "3px solid #00c853", borderRadius: "0 4px 0 0" }}/>
                <div style={{ position: "absolute", bottom: "-2px", left: "-2px", width: "20px", height: "20px", borderBottom: "3px solid #00c853", borderLeft: "3px solid #00c853", borderRadius: "0 0 0 4px" }}/>
                <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "20px", height: "20px", borderBottom: "3px solid #00c853", borderRight: "3px solid #00c853", borderRadius: "0 0 4px 0" }}/>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>Point at product front</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button onClick={capturePhoto} style={{ flex: 1, background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "16px", borderRadius: "14px", fontSize: "16px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📸</span> Capture Photo
              </button>
              <button onClick={stopCamera} style={{ background: "white", color: "#ff3d57", border: "1px solid rgba(255,61,87,0.2)", padding: "16px 24px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {(mode === "preview" || mode === "detected") && (
          <div style={{ marginTop: "8px" }}>
            {preview && <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "16px", border: "1px solid rgba(0,200,83,0.1)" }}><img src={preview} alt="Product" style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }}/></div>}

            {analyzing && (
              <div style={{ background: "white", borderRadius: "16px", padding: "32px", textAlign: "center", border: "1px solid rgba(0,200,83,0.1)" }}>
                <div style={{ width: "48px", height: "48px", border: "3px solid rgba(0,200,83,0.2)", borderTop: "3px solid #00c853", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}/>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "6px" }}>AI is reading the product...</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>Identifying product name, brand and category</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {mode === "detected" && detected && !analyzing && (
              <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.15)", boxShadow: "0 8px 40px rgba(0,200,83,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "36px", height: "36px", background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✓</div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0a5c36" }}>Product Detected by AI</h3>
                </div>
                <div style={{ background: "#f8faf8", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Product Name</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117" }}>{detected.productName}</div>
                  </div>
                  <div style={{ marginBottom: detected.category ? "10px" : "0" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Brand</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#0d1117" }}>{detected.brandName}</div>
                  </div>
                  {detected.category && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Category</div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#0a5c36", background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "100px", padding: "4px 14px" }}>{detected.category}</span>
                    </div>
                  )}
                </div>
                {detected.confidence && (
                  <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#f0faf4", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: detected.confidence + "%", background: "linear-gradient(90deg,#0a5c36,#00c853)", borderRadius: "3px" }}/>
                    </div>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", whiteSpace: "nowrap" }}>{detected.confidence}% confidence</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button onClick={searchDetected} style={{ flex: 1, minWidth: "200px", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 20px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: "pointer" }}>Search Trustified Database</button>
                  <button onClick={() => { setMode("choice"); setPreview(null); setDetected(null); setError("") }} style={{ background: "white", color: "#6b7280", border: "1px solid rgba(0,0,0,0.1)", padding: "14px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Scan Again</button>
                </div>
              </div>
            )}

            {mode === "preview" && !analyzing && (
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button onClick={() => { setMode("choice"); setPreview(null); setDetected(null); setError("") }} style={{ flex: 1, background: "white", color: "#0a5c36", border: "1px solid rgba(0,200,83,0.2)", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Try Again</button>
                <button onClick={() => fileRef.current.click()} style={{ flex: 1, background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: "pointer" }}>Upload Different Photo</button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }}/>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}