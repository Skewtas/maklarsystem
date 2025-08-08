/**
 * Property Images API Routes - /api/properties/[id]/images
 * 
 * Handles image management for properties:
 * - GET: List all images for a property
 * - POST: Upload new images
 * - PUT: Update image metadata (captions, order, primary status)
 * - DELETE: Remove images
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { 
  PropertyImage, 
  PropertyImageUploadResponse 
} from '@/types/property.types';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const paramsSchema = z.object({
  id: z.string().uuid('Invalid property ID')
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
 * Check if user can manage images for this property
 */
async function checkImagePermission(
  supabase: any, 
  userId: string, 
  propertyId: string
): Promise<boolean> {
  const { data: property } = await supabase
    .from('properties')
    .select('created_by')
    .eq('id', propertyId)
    .single();
    
  if (!property) return false;
  
  // Owner can manage images
  if (property.created_by === userId) return true;
  
  // Check if user has admin role
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  return userProfile?.role === 'admin';
}

/**
 * Transform database row to PropertyImage
 */
function transformToPropertyImage(row: any): PropertyImage {
  return {
    id: row.id,
    propertyId: row.property_id,
    url: row.url,
    thumbnailUrl: row.thumbnail_url,
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
  propertyId: string,
  file: File,
  userId: string
): Promise<{ url: string; thumbnailUrl: string; error?: string }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Upload original image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { url: '', thumbnailUrl: '', error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    // For thumbnail, we would typically use image processing
    // For now, use the same URL as thumbnail
    const thumbnailUrl = publicUrl;

    return { url: publicUrl, thumbnailUrl };

  } catch (error) {
    return { 
      url: '', 
      thumbnailUrl: '', 
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
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltigt fastighets-ID',
          errors: result.error.issues
        },
        { status: 400 }
      );
    }

    const { id: propertyId } = result.data;

    // Initialize Supabase client
    const supabase = createClient();
    
    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, status')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, message: 'Fastighet hittades inte' },
        { status: 404 }
      );
    }

    // Get images
    const { data: images, error: imagesError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('display_order', { ascending: true });

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

    const { id: propertyId } = result.data;

    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att ladda upp bilder' },
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

    // Check current image count
    const { count: currentImageCount } = await supabase
      .from('property_images')
      .select('id', { count: 'exact' })
      .eq('property_id', propertyId);

    if (currentImageCount && currentImageCount >= 50) {
      return NextResponse.json(
        { success: false, message: 'Maximalt 50 bilder per fastighet tillåtna' },
        { status: 400 }
      );
    }

    // For now, return placeholder response since we need to implement file upload handling
    return NextResponse.json(
      { 
        success: false, 
        message: 'Bilduppladdning implementeras senare',
        data: null
      } as PropertyImageUploadResponse,
      { status: 501 }
    );

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
    const supabase = createClient();
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

    // For now, return placeholder response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Uppdatering av bilddata implementeras senare',
        data: null
      },
      { status: 501 }
    );

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