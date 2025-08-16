import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Dev helper: ensure storage bucket 'property-images' exists
export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient()
    const { data: bucket } = await admin.storage.getBucket('property-images')
    if (!bucket) {
      const { error: createErr } = await admin.storage.createBucket('property-images', {
        public: false,
        fileSizeLimit: '10485760',
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
      })
      if (createErr) {
        return NextResponse.json({ ok: false, message: createErr.message }, { status: 400 })
      }
      return NextResponse.json({ ok: true, created: true })
    }
    return NextResponse.json({ ok: true, created: false })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'unknown error' }, { status: 500 })
  }
}





