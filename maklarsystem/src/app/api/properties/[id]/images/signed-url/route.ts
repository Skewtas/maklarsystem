import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const bodySchema = z.object({ imageId: z.string().uuid(), expiresIn: z.number().int().min(30).max(60 * 60).default(600) })

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await request.json().catch(() => ({}))
    const parse = bodySchema.safeParse(json)
    if (!parse.success) {
      return NextResponse.json({ success: false, message: 'Ogiltig begäran', errors: parse.error.issues }, { status: 400 })
    }
    const { imageId, expiresIn } = parse.data

    const objektId = params.id
    const supabase = await createClient()

    // Auth: must be logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Ej inloggad' }, { status: 401 })

    // Verify access via RLS on property_images
    const { data: img, error } = await supabase
      .from('property_images')
      .select('id, path, objekt_id')
      .eq('id', imageId)
      .eq('objekt_id', objektId)
      .single()

    if (error || !img) {
      return NextResponse.json({ success: false, message: 'Bild hittades inte eller behörighet saknas' }, { status: 404 })
    }

    // Use admin client to sign URL for private bucket
    const admin = createAdminClient()
    const { data: signed, error: signErr } = await admin.storage
      .from('property-images')
      .createSignedUrl(img.path, expiresIn)

    if (signErr || !signed) {
      return NextResponse.json({ success: false, message: signErr?.message || 'Kunde inte skapa signerad URL' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { signedUrl: signed.signedUrl, expiresIn } })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internt fel', error: String(e) }, { status: 500 })
  }
}



