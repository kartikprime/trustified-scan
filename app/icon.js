import { ImageResponse } from "next/og"

// runtime removed for static compatibility
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0a5c36,#00c853)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: 900 }}>
        T
      </div>
    ),
    { ...size }
  )
}