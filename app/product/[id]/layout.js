import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function generateMetadata({ params }) {
  const { id } = params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trustifiedscan.in"

  try {
    const { data: product } = await supabase
      .from("products")
      .select("name,brand,category,trust_score,short_description,product_image_url,testing_status")
      .eq("id", id)
      .eq("is_published", true)
      .single()

    if (!product) {
      return {
        title: "Product Not Found — Trustified Scan",
        description: "This product has not been tested by Trustified yet.",
      }
    }

    const status = product.testing_status === "passed" ? "✅ PASSED" : product.testing_status === "failed" ? "❌ FAILED" : "⚠️ PARTIAL"
    const title = `${product.name} by ${product.brand} — Trust Score ${product.trust_score}/100 ${status}`
    const description = product.short_description ||
      `${product.name} by ${product.brand} lab tested by Trustified. Trust Score: ${product.trust_score}/100. Independent lab verified results — no brand influence.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/product/${id}`,
        siteName: "Trustified Scan",
        images: product.product_image_url
          ? [{ url: product.product_image_url, width: 400, height: 400, alt: product.name }]
          : [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: "Trustified Scan" }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.product_image_url ? [product.product_image_url] : [],
      },
    }
  } catch {
    return {
      title: "Trustified Scan — India Food Safety Checker",
      description: "Search any health supplement. Get instant independent lab-verified results.",
    }
  }
}

export default function ProductLayout({ children }) {
  return children
}