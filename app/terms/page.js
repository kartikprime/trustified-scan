export default function TermsPage() {
  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", padding: "48px 24px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: "900", color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Terms of Service</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>Last updated: January 2025</p>
      </div>
      <div style={{ maxWidth: "800px", margin: "-24px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", border: "1px solid rgba(0,200,83,0.1)", lineHeight: "1.8", color: "#374151" }}>
          {[
            {
              title: "1. Acceptance of Terms",
              content: "By accessing and using Trustified Scan, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this website."
            },
            {
              title: "2. About Trustified Scan",
              content: "Trustified Scan is an independent platform that displays lab test results conducted by Trustified. All test results are based on independent laboratory testing. We do not accept payment from brands to influence test results or ratings."
            },
            {
              title: "3. Disclaimer of Liability",
              content: "The information provided on Trustified Scan is for general informational purposes only. Lab test results reflect testing of specific batches at specific points in time. Product formulations may change. We make no warranty that products currently available in the market match the tested batch. Always consult a qualified healthcare professional before making health decisions."
            },
            {
              title: "4. Accuracy of Information",
              content: "While we strive for accuracy, Trustified Scan does not guarantee that all information is complete, accurate, or current. Lab results are based on testing conducted by third-party laboratories. We are not responsible for errors or omissions in test results."
            },
            {
              title: "5. Affiliate Links",
              content: "Some product pages may contain affiliate links. If you purchase a product through these links, we may receive a small commission at no extra cost to you. This does not influence our test results or ratings."
            },
            {
              title: "6. Intellectual Property",
              content: "All content on Trustified Scan including text, graphics, logos, and data is the property of Trustified Scan. You may not reproduce, distribute, or create derivative works without our written permission."
            },
            {
              title: "7. User Conduct",
              content: "You agree not to misuse this website, attempt to gain unauthorized access, or use automated systems to scrape data. Product test requests must be genuine and for real Indian food or supplement products."
            },
            {
              title: "8. Changes to Terms",
              content: "We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms."
            },
            {
              title: "9. Contact",
              content: "For any questions about these terms, please contact us through the Trustified official website at trustified.in"
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