import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { password } = await request.json()
    if (!password) return NextResponse.json({ success: false, error: "No password" })

    const masterPassword = process.env.ADMIN_MASTER_PASSWORD
    if (!masterPassword) return NextResponse.json({ success: false, error: "Server config error" })

    if (password === masterPassword) {
      return NextResponse.json({ success: true, token: "tru_" + Buffer.from(masterPassword + "_trustified").toString("base64") })
    }

    return NextResponse.json({ success: false, error: "Wrong password" })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}