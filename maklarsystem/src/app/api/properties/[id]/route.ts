/**
 * Objekt API Routes - /api/properties/[id]
 *
 * OBS: Dessa endpoints opererar numera på tabellen 'objekt' (svensk domänmodell)
 * och används för att hämta/uppdatera/ta bort ett objekt.
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { objektUpdateSchema } from '@/lib/validation/schemas/objekt.schema'
import type { Database } from '@/types/database'

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const paramsSchema = z.object({
  id: z.string().min(1, 'Property ID is required')
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

type ObjektRow = Database['public']['Tables']['objekt']['Row']

/**
 * Check if user has permission to access/modify property
 */
async function checkObjektPermission(
  supabase: any, 
  userId: string, 
  objektId: string, 
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  // Läsning tillåts (RLS begränsar ändå nycklar)
  if (action === 'read') return true

  // För skriv/radera: ägare (maklare) eller admin
  const { data: objekt } = await supabase
    .from('objekt')
    .select('maklare_id')
    .eq('id', objektId)
    .single()

  if (!objekt) return false
  if (objekt.maklare_id === userId) return true

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return profile?.role === 'admin'
}

async function getObjektById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('objekt')
    .select(`
      *,
      maklare:users!maklare_id(id, full_name, email),
      saljare:kontakter!saljare_id(id, fornamn, efternamn, email, telefon),
      kopare:kontakter!kopare_id(id, fornamn, efternamn, email, telefon)
    `)
    .eq('id', id)
    .single()

  return { objekt: data as ObjektRow | null, error }
}

// ============================================================
// API HANDLERS
// ============================================================

/**
 * GET /api/properties/[id]
 * Fetch single property by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate parameters
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltigt fastighets-ID',
          errors: result.error.issues
        },
        { status: 400 }
      );
    }

    const { id } = result.data;

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Get current user for permission checking
    const { data: { user } } = await supabase.auth.getUser();
    
    // Hämta objekt
    const { objekt, error } = await getObjektById(supabase, id)
    if (error || !objekt) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Objekt hittades inte'
        },
        { status: 404 }
      );
    }

    // Behörighet (läs)
    const canRead = await checkObjektPermission(supabase, user?.id || '', objekt.id, 'read')
    if (!canRead) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att visa detta objekt' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: objekt })

  } catch (error) {
    console.error('Property GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid hämtning av fastighet',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/properties/[id]
 * Update existing property
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate parameters
    const paramsResult = paramsSchema.safeParse(params);
    if (!paramsResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltigt fastighets-ID',
          errors: paramsResult.error.issues
        },
        { status: 400 }
      );
    }

    const { id } = paramsResult.data;

    // Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att uppdatera objekt' },
        { status: 401 }
      );
    }

    // Behörighet
    const canWrite = await checkObjektPermission(supabase, user.id, id, 'write')
    if (!canWrite) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att uppdatera detta objekt' },
        { status: 403 }
      );
    }

    // Validera body
    const body = await request.json()
    const validationResult = objektUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltiga objektdata',
          errors: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from('objekt')
      .update(validationResult.data)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Fel vid uppdatering av objekt', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updated })

  } catch (error) {
    console.error('Property PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid uppdatering av fastighet',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete property and associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate parameters
    const paramsResult = paramsSchema.safeParse(params);
    if (!paramsResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltigt fastighets-ID',
          errors: paramsResult.error.issues
        },
        { status: 400 }
      );
    }

    const { id } = paramsResult.data;

    // Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att radera objekt' },
        { status: 401 }
      );
    }

    // Behörighet
    const canDelete = await checkObjektPermission(supabase, user.id, id, 'delete')
    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att radera detta objekt' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('objekt')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Fel vid borttagning av objekt', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Objekt raderat' })

  } catch (error) {
    console.error('Property DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid borttagning av fastighet',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}