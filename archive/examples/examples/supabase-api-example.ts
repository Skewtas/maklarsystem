// Example: Supabase API Pattern with RLS and Error Handling
// Shows the standard pattern for API routes with proper security

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Query parameters validation
const querySchema = z.object({
  status: z.enum(['till_salu', 'under_kontrakt', 'sald']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    // 1. Initialize Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // 2. Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Ej autentiserad' },
        { status: 401 }
      );
    }
    
    // 3. Parse and validate query parameters
    const url = new URL(request.url);
    const params = {
      status: url.searchParams.get('status'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
    };
    
    const validatedParams = querySchema.parse(params);
    
    // 4. Build query with proper filtering
    let query = supabase
      .from('objekt')
      .select(`
        id,
        fastighetsbeteckning,
        adress,
        objektTyp: objekt_typ,
        boarea,
        utgangspris,
        status,
        skapad: created_at,
        uppdaterad: updated_at,
        mäklare:users!objekt_maklare_id_fkey(
          id,
          namn: full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);
    
    // Apply optional filters
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status);
    }
    
    // 5. Execute query with error handling
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Kunde inte hämta objekt' },
        { status: 500 }
      );
    }
    
    // 6. Format response with Swedish conventions
    const formattedData = data?.map(objekt => ({
      ...objekt,
      utgangspris: new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
        maximumFractionDigits: 0,
      }).format(objekt.utgangspris),
    }));
    
    // 7. Return paginated response
    return NextResponse.json({
      objekt: formattedData || [],
      pagination: {
        total: count || 0,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: (count || 0) > validatedParams.offset + validatedParams.limit,
      },
    });
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ogiltiga parametrar', details: error.errors },
        { status: 400 }
      );
    }
    
    // Generic error handling
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Ej autentiserad' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    // Use objektSchema from validation library
    
    // Insert with RLS policies applied
    const { data, error } = await supabase
      .from('objekt')
      .insert({
        ...body,
        maklare_id: session.user.id,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Kunde inte skapa objekt' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    );
  }
}