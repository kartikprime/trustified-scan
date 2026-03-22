export default function PrivacyPage() {
  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Privacy Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>Last updated: January 2025</p>
      </div>
      <div style={{ maxWidth: "800px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", border: "1px solid rgba(0,200,83,0.1)", lineHeight: "1.8" }}>
          {[
            {
              title: "1. Information We Collect",
              content: "Trustified Scan does not require account registration. We do not collect personal information such as names, email addresses, or phone numbers. We may collect anonymous usage data such as pages visited and search queries to improve our service."
            },
            {
              title: "2. Product Test Requests",
              content: "When you submit a product test request, we collect the product name, brand name, and your IP address. This information is used only to process your request and prevent spam. We do not share this information with third parties."
            },
            {
              title: "3. Cookies",
              content: "Trustified Scan uses minimal cookies necessary for the website to function. We do not use tracking cookies or advertising cookies. We do not use Google Analytics or similar tracking services."
            },
            {
              title: "4. Third Party Services",
              content: "We use Supabase for database storage and Google Gemini AI for product analysis. These services have their own privacy policies. We do not share personal data with these services beyond what is necessary for operation."
            },
            {
              title: "5. Data Security",
              content: "We implement industry standard security measures to protect your data. All data is transmitted over encrypted HTTPS connections. Admin access is protected by server-side authentication."
            },
            {
              title: "6. Data Retention",
              content: "Product test requests are retained for record-keeping purposes. Anonymous usage data is retained for up to 30 days. We do not sell or rent any data to third parties."
            },
            {
              title: "7. Children Privacy",
              content: "Trustified Scan is not directed at children under 13. We do not knowingly collect information from children."
            },
            {
              title: "8. Your Rights",
              content: "You have the right to request deletion of any personal data we hold about you. Contact us through the Trustified official website to make such requests."
            },
            {
              title: "9. Changes to Privacy Policy",
              content: "We may update this policy periodically. Continued use of the website after changes constitutes acceptance of the updated policy."
            },
            {
              title: "10. Contact",
              content: "For privacy related questions, contact us through trustified.in"
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "10px" }}>{section.title}</h2>
              <p style={{ fontSize: "15px", color: "#6b7280" }}>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}