import { Inter } from "next/font/google"
import "./globals.css"
import Header from "./components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Trustified Scan — India Health Supplement Safety Checker",
  description: "Search any health supplement. Get instant independent lab-verified results. No brand influence. No paid promotions.",
  keywords: "protein powder test, supplement safety, trustified, lab test results, whey protein review india",
  openGraph: {
    title: "Trustified Scan",
    description: "India first supplement safety scanner powered by Trustified independent lab tests.",
    siteName: "Trustified Scan",
    type: "website",
  },
}

function Footer() {
  return (
    <footer style={{ marginTop: "80px", padding: "40px 24px", borderTop: "1px solid rgba(0,200,83,0.1)", background: "#f8faf8" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "32px", marginBottom: "32px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg,#0a5c36,#00c853)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "15px", color: "white" }}>T</div>
              <span style={{ fontSize: "15px", fontWeight: "800", background: "linear-gradient(135deg,#0a5c36,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Trustified Scan</span>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "13px", maxWidth: "260px", lineHeight: "1.6", marginBottom: "12px" }}>India first supplement safety scanner powered by Trustified independent lab tests.</p>
            <div style={{ background: "rgba(255,143,0,0.08)", border: "1px solid rgba(255,143,0,0.2)", borderRadius: "8px", padding: "10px 12px", maxWidth: "260px" }}>
              <p style={{ color: "#e65100", fontSize: "11px", lineHeight: "1.5", fontWeight: "600" }}>⚠️ Results based on specific batch testing. Not a substitute for professional advice.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0d1117", marginBottom: "12px", letterSpacing: "0.5px" }}>EXPLORE</div>
              {[["Search","/search"],["Scan","/scan"],["Rankings","/rankings"],["Compare","/compare"],["Brands","/brands"]].map(([label,href]) => (
                <a key={href} href={href} style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0d1117", marginBottom: "12px", letterSpacing: "0.5px" }}>LEARN</div>
              {[["Ingredients","/ingredients"],["Request Test","/request"]].map(([label,href]) => (
                <a key={href} href={href} style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>{label}</a>
              ))}
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0d1117", marginBottom: "12px", marginTop: "16px", letterSpacing: "0.5px" }}>LEGAL</div>
              {[["Terms of Service","/terms"],["Privacy Policy","/privacy"],["Disclaimer","https://docs.google.com/document/d/13cUREmyWGS-WZGJOifQZBWhCv_nr3flh/edit"]].map(([label,href]) => (
                <a key={href} href={href} target={href.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0d1117", marginBottom: "12px", letterSpacing: "0.5px" }}>TRUSTIFIED</div>
              <a href="https://www.trustified.in" target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>Official Website</a>
              <a href="https://www.youtube.com/@Trustified-Certification" target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>YouTube Channel</a>
              <a href="https://shop.trustified.in" target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>Shop</a>
              <a href="https://apps.apple.com/in/app/trustified/id6473800943" target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none", marginBottom: "8px" }}>App Store</a>
              <a href="https://play.google.com/store/apps/details?id=com.trustified.app" target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "#9ca3af", fontSize: "13px", textDecoration: "none" }}>Google Play</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(0,200,83,0.08)", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>© 2025 Trustified Scan. All lab results verified by Trustified.</p>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>Made with ❤️ for Indian consumers</p>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}