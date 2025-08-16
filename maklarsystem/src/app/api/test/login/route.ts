import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Extra safeguard: disable in production unless explicitly allowed
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_ROUTES !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 })
  }
}


