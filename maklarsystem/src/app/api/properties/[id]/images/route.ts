/**
 * Objekt Images API Routes - /api/properties/[id]/images
 * 
 * Handles image management for properties:
 * - GET: List all images for a property
 * - POST: Upload new images
 * - PUT: Update image metadata (captions, order, primary status)
 * - DELETE: Remove images
 */
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { ensureUserProfile } from '@/utils/supabase/ensure-user-profile';
// Using generic typing locally to avoid coupling to legacy property types
type PropertyImage = {
  id: string
  propertyId: string
  url?: string | null
  thumbnailUrl?: string | null
  caption?: string | null
  isPrimary?: boolean | null
  isFloorplan?: boolean | null
  displayOrder?: number | null
  width?: number | null
  height?: number | null
  sizeBytes?: number | null
  createdAt: Date
}

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const paramsSchema = z.object({
  id: z.string().uuid('Invalid objekt ID')
});

const imageUpdateSchema = z.object({
  imageId: z.string().uuid(),
  caption: z.string().max(255).optional(),
  isPrimary: z.boolean().optional(),
  isFloorplan: z.boolean().optional(),
  displayOrder: z.number().int().min(1).max(50).optional()
});

const imageUploadMetadataSchema = z.object({
  caption: z.string().max(255).optional(),
  isFloorplan: z.boolean().default(false),
  displayOrder: z.number().int().min(1).max(50).optional()
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if user can manage images for this objekt
 */
async function checkImagePermission(
  supabase: any, 
  userId: string, 
  objektId: string
): Promise<boolean> {
  const { data: objekt } = await supabase
    .from('objekt')
    .select('maklare_id')
    .eq('id', objektId)
    .single();

  if (!objekt) return false;

  // Owner (mäklare) can manage images
  if (objekt.maklare_id === userId) return true;
  
  // Check if user has admin role (but don't fail if profile doesn't exist)
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  // If no profile exists, still allow if they own the property
  // This handles the case where user_profiles table is empty
  if (!userProfile) {
    return objekt.maklare_id === userId;
  }
  
  return userProfile?.role === 'admin';
}

/**
 * Transform database row to PropertyImage
 */
function transformToPropertyImage(row: any): PropertyImage {
  return {
    id: row.id,
    propertyId: row.objekt_id,
    url: row.path,
    thumbnailUrl: row.thumbnail_path,
    caption: row.caption,
    isPrimary: row.is_primary,
    isFloorplan: row.is_floorplan,
    displayOrder: row.display_order,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    createdAt: new Date(row.created_at)
  };
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImageToStorage(
  supabase: any,
  objektId: string,
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${objektId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Upload original image (private bucket) as the authenticated user (owner = auth.uid())
    const arrayBuf = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream'
      });

    if (uploadError) {
      return { path: '', error: uploadError.message };
    }

    // Return storage path; URLs should be signed via the signed-url endpoint
    return { path: fileName };

  } catch (error) {
    return { 
      path: '', 
      error: error instanceof Error ? error.message : 'Okänt fel vid uppladdning' 
    };
  }
}

// ============================================================
// API HANDLERS
// ============================================================

/**
 * GET /api/properties/[id]/images
 * List all images for a property
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate parameters
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      // Fallback: extract id from URL path if params missing
      const url = new URL(request.url)
      const m = url.pathname.match(/\/api\/properties\/([^/]+)\/images/)
      const fallbackId = m?.[1]
      if (fallbackId) {
        (params as any).id = fallbackId
      } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltigt fastighets-ID',
          errors: result.error.issues
        },
        { status: 400 }
      );
      }
    }

    const { id: objektId } = (params as any);

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Verify objekt exists
    const { data: objekt, error: objektError } = await supabase
      .from('objekt')
      .select('id, status')
      .eq('id', objektId)
      .single();

    if (objektError || !objekt) {
      return NextResponse.json(
        { success: false, message: 'Objekt hittades inte' },
        { status: 404 }
      );
    }

    // Get images
    const { data: images, error: imagesError } = await supabase
      .from('property_images')
      .select('*')
      .eq('objekt_id', objektId)
      .order('display_order', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true });

    if (imagesError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fel vid hämtning av bilder',
          error: process.env.NODE_ENV === 'development' ? imagesError.message : undefined
        },
        { status: 500 }
      );
    }

    const propertyImages: PropertyImage[] = (images || []).map(transformToPropertyImage);

    return NextResponse.json({
      success: true,
      data: propertyImages,
      message: `Hittade ${propertyImages.length} ${propertyImages.length === 1 ? 'bild' : 'bilder'}`
    });

  } catch (error) {
    console.error('Images GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid hämtning av bilder',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/[id]/images
 * Upload new images for a property
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate parameters
    const result2 = paramsSchema.safeParse(params);
    if (!result2.success) {
      const url = new URL(request.url)
      const m = url.pathname.match(/\/api\/properties\/([^/]+)\/images/)
      const fallbackId = m?.[1]
      if (fallbackId) {
        (params as any).id = fallbackId
      } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltigt fastighets-ID',
          errors: result2.error.issues
        },
        { status: 400 }
      );
      }
    }

    const { id: objektId } = (params as any);

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att ladda upp bilder' },
        { status: 401 }
      );
    }
    
    // Ensure user profile exists (creates one if missing)
    await ensureUserProfile(user.id, user.email);

    // Check permission
    const canManageImages = await checkImagePermission(supabase, user.id, objektId);
    if (!canManageImages) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att hantera bilder för denna fastighet' },
        { status: 403 }
      );
    }

    // Check current image count
    const { count: currentImageCount } = await supabase
      .from('property_images')
      .select('id', { count: 'exact' })
      .eq('objekt_id', objektId);

    if (currentImageCount && currentImageCount >= 50) {
      return NextResponse.json(
        { success: false, message: 'Maximalt 50 bilder per fastighet tillåtna' },
        { status: 400 }
      );
    }

    // Ensure storage bucket exists (idempotent)
    try {
      const admin = createAdminClient()
      const { data: buckets } = await admin.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === 'property-images')
      
      if (!bucketExists) {
        console.log('Creating property-images bucket...')
        const { data, error } = await admin.storage.createBucket('property-images', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
        })
        if (error) {
          console.error('Failed to create bucket:', error)
        } else {
          console.log('Bucket created successfully')
        }
      }
    } catch (e) {
      console.error('Image upload: ensure bucket failed:', e)
      // continue; the upload will fail anyway if bucket truly missing
    }

    // Multipart/form-data expected with one file named "file"
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      const keys: string[] = []
      for (const [k] of formData.entries()) keys.push(k)
      console.error('Image upload: no file in formData. Keys present:', keys)
      return NextResponse.json({ success: false, message: 'Ingen fil skickades', keys }, { status: 400 })
    }
    try {
      // optional debug
      // @ts-ignore
      console.log('Image upload: file received', { name: file.name, size: (file as any)?.size })
    } catch {}

    // Upload to storage using admin client to bypass RLS
    const adminClient = createAdminClient()
    const { path, error } = await uploadImageToStorage(adminClient, objektId, file, user.id)
    if (error) {
      console.error('Image upload: storage error:', error)
      return NextResponse.json({ success: false, message: error }, { status: 400 })
    }

    // Create DB row using admin client to bypass RLS (we already checked permissions)
    const { data: inserted, error: insertErr } = await adminClient
      .from('property_images')
      .insert({ 
        objekt_id: objektId, 
        user_id: user.id, 
        path, 
        thumbnail_path: path, 
        caption: null,
        is_primary: false,
        is_floorplan: false
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Image upload: DB insert error:', insertErr.message)
      return NextResponse.json({ success: false, message: insertErr.message }, { status: 400 })
    }

    // Also return a signed URL so client can render immediately
    const { data: signedUrlData } = await adminClient.storage
      .from('property-images')
      .createSignedUrl(path, 600) // 10 minutes

    return NextResponse.json({ 
      success: true, 
      message: 'Bild uppladdad', 
      data: { 
        id: inserted.id, 
        path, 
        signedUrl: signedUrlData?.signedUrl 
      } 
    })

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid uppladdning av bilder',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/properties/[id]/images
 * Update image metadata (caption, order, primary status)
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

    const { id: propertyId } = paramsResult.data;

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att uppdatera bilder' },
        { status: 401 }
      );
    }

    // Check permission
    const canManageImages = await checkImagePermission(supabase, user.id, propertyId);
    if (!canManageImages) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att hantera bilder för denna fastighet' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = imageUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltiga bilddata',
          errors: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { imageId, caption, isPrimary, isFloorplan, displayOrder } = validationResult.data

    // If setting primary, unset others first to ensure single primary
    if (isPrimary === true) {
      const { error: unsetErr } = await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('objekt_id', propertyId)

      if (unsetErr) {
        return NextResponse.json({ success: false, message: unsetErr.message }, { status: 400 })
      }
    }

    const updates: Record<string, unknown> = {}
    if (typeof caption !== 'undefined') updates.caption = caption
    if (typeof isPrimary !== 'undefined') updates.is_primary = isPrimary
    if (typeof isFloorplan !== 'undefined') updates.is_floorplan = isFloorplan
    if (typeof displayOrder !== 'undefined') updates.display_order = displayOrder

    const { data, error: updateErr } = await supabase
      .from('property_images')
      .update(updates)
      .eq('id', imageId)
      .eq('objekt_id', propertyId)
      .select('*')
      .single()

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Bild uppdaterad', data })

  } catch (error) {
    console.error('Image update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid uppdatering av bilddata',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/[id]/images/[imageId]
 * This would be handled by a separate route file for individual image deletion
 */