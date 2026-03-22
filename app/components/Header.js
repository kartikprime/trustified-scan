"use client"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/shop", label: "🛒 Shop" },
  { href: "/scan", label: "Scan" },
  { href: "/rankings", label: "Rankings" },
  { href: "/brands", label: "Brands" },
  { href: "/compare", label: "Compare" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/request", label: "Request" },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        .nav-desktop { display: flex; }
        .nav-mobile-btn { display: none; }
        @media (max-width: 1000px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        .nav-link:hover { color: #00c853 !important; background: rgba(0,200,83,0.06) !important; }
        .shop-link { color: #0a5c36 !important; background: rgba(0,200,83,0.08) !important; border: 1px solid rgba(0,200,83,0.2) !important; border-radius: 8px !important; }
        .shop-link:hover { background: rgba(0,200,83,0.15) !important; }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "0 24px", height: "70px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,200,83,0.12)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#0a5c36,#00c853)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px", color: "white" }}>T</div>
          <span style={{ fontSize: "17px", fontWeight: "800", background: "linear-gradient(135deg,#0a5c36,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Trustified Scan</span>
        </a>

        <nav className="nav-desktop" style={{ alignItems: "center", gap: "2px" }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className={"nav-link" + (link.href === "/shop" ? " shop-link" : "")} style={{ color: "#6b7280", textDecoration: "none", padding: "6px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", transition: "all 0.2s ease" }}>{link.label}</a>
          ))}
          <a href="/admin" style={{ color: "white", textDecoration: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "800", background: "linear-gradient(135deg,#0a5c36,#00c853)", marginLeft: "6px" }}>Admin</a>
        </nav>

        <div className="nav-mobile-btn" style={{ alignItems: "center", gap: "10px" }}>
          <a href="/shop" style={{ color: "#0a5c36", textDecoration: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)" }}>🛒 Shop</a>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "1px solid rgba(0,200,83,0.3)", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ width: "20px", height: "2px", background: "#0a5c36", borderRadius: "2px", display: "block" }}/>
            <span style={{ width: "20px", height: "2px", background: "#0a5c36", borderRadius: "2px", display: "block" }}/>
            <span style={{ width: "20px", height: "2px", background: "#0a5c36", borderRadius: "2px", display: "block" }}/>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: "fixed", top: "70px", left: 0, right: 0, zIndex: 999, background: "white", borderBottom: "1px solid rgba(0,200,83,0.12)", flexDirection: "column", padding: "12px 24px 16px", boxShadow: "0 8px 30px rgba(0,0,0,0.1)", display: "flex" }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ color: link.href === "/shop" ? "#0a5c36" : "#0d1117", textDecoration: "none", padding: "12px 0", fontSize: "15px", fontWeight: "600", borderBottom: "1px solid rgba(0,200,83,0.06)", display: "block", background: link.href === "/shop" ? "rgba(0,200,83,0.04)" : "transparent", paddingLeft: link.href === "/shop" ? "8px" : "0", borderRadius: link.href === "/shop" ? "6px" : "0" }}>{link.label}</a>
          ))}
          <a href="/admin" onClick={() => setMenuOpen(false)} style={{ color: "white", textDecoration: "none", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", background: "linear-gradient(135deg,#0a5c36,#00c853)", marginTop: "12px", display: "block", textAlign: "center" }}>Admin Panel</a>
        </div>
      )}
    </>
  )
}