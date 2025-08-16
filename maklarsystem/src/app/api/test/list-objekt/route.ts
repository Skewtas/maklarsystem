import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_ROUTES !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const url = new URL(req.url)
    const adress = url.searchParams.get('adress') || undefined

    const admin = createAdminClient()
    let query = admin.from('objekt').select('*').order('created_at', { ascending: false })
    if (adress) {
      query = query.ilike('adress', adress)
    }
    const { data, error } = await query.limit(50)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 })
  }
}






