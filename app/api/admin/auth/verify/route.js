import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ valid: false })

    const masterPassword = process.env.ADMIN_MASTER_PASSWORD
    const validToken = "tru_" + Buffer.from(masterPassword + "_trustified").toString("base64")

    return NextResponse.json({ valid: token === validToken })
  } catch {
    return NextResponse.json({ valid: false })
  }
}