import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
    const { count: paramCount } = await supabase
      .from('safety_parameters')
      .select('*', { count: 'exact', head: true })
    return NextResponse.json({
      products: productCount || 0,
      params: paramCount || 0,
    })
  } catch {
    return NextResponse.json({ products: 0, params: 0 })
  }
}
