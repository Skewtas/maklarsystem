import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

const paramsSchema = z.object({ id: z.string().uuid(), imageId: z.string().uuid() })

export async function DELETE(request: NextRequest, { params }: { params: { id: string, imageId: string } }) {
  try {
    const parse = paramsSchema.safeParse(params)
    if (!parse.success) {
      return NextResponse.json({ success: false, message: 'Ogiltiga parametrar', errors: parse.error.issues }, { status: 400 })
    }
    const { id: objektId, imageId } = parse.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Ej inloggad' }, { status: 401 })

    // RLS skyddar så endast ägare/admin får ta bort
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId)
      .eq('objekt_id', objektId)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Bild raderad' })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internt fel', error: String(e) }, { status: 500 })
  }
}


