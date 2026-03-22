export default function NotFound() {
  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "48px 24px", maxWidth: "500px" }}>
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>🔬</div>
        <div style={{ fontSize: "14px", fontWeight: "800", color: "#00c853", letterSpacing: "3px", marginBottom: "16px" }}>404 — PAGE NOT FOUND</div>
        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#0d1117", marginBottom: "12px", letterSpacing: "-1px" }}>This page does not exist</h1>
        <p style={{ color: "#9ca3af", fontSize: "16px", lineHeight: "1.7", marginBottom: "32px" }}>
          The page you are looking for may have been moved, deleted, or never existed. Try searching for the product you are looking for.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", textDecoration: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "700" }}>Go Home</a>
          <a href="/search" style={{ background: "white", color: "#0a5c36", textDecoration: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", border: "1px solid rgba(0,200,83,0.3)" }}>Search Products</a>
        </div>
        <div style={{ marginTop: "40px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {[["Rankings","/rankings"],["Brands","/brands"],["Compare","/compare"],["Request Test","/request"]].map(([label, href]) => (
            <a key={href} href={href} style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>{label} →</a>
          ))}
        </div>
      </div>
    </div>
  )
}