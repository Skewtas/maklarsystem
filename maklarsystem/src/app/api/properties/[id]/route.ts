/**
 * Individual Property API Routes - /api/properties/[id]
 * 
 * Handles CRUD operations for individual properties:
 * - GET: Fetch single property by ID or slug
 * - PUT: Update existing property
 * - DELETE: Delete property
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { 
  propertySchema,
  updatePropertySchema 
} from '@/lib/validation/schemas/property.schema';
import { 
  Property, 
  PropertyApiResponse, 
  PropertyImage 
} from '@/types/property.types';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const paramsSchema = z.object({
  id: z.string().min(1, 'Property ID is required')
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Transform database row to Property interface
 */
function transformToProperty(row: any, images: PropertyImage[] = []): Property {
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    fastighetsbeteckning: row.fastighetsbeteckning,
    propertyType: row.property_type,
    status: row.status,
    address: {
      street: row.street,
      city: row.city,
      postalCode: row.postal_code,
      municipality: row.municipality,
      county: row.county,
      coordinates: row.coordinates ? {
        lat: row.coordinates.lat,
        lng: row.coordinates.lng
      } : undefined
    },
    specifications: {
      livingArea: row.living_area,
      totalArea: row.total_area,
      plotArea: row.plot_area,
      rooms: row.rooms,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      buildYear: row.build_year,
      floor: row.floor,
      floors: row.floors,
      hasElevator: row.has_elevator,
      hasBalcony: row.has_balcony,
      hasGarden: row.has_garden,
      hasParking: row.has_parking,
      energyClass: row.energy_class,
      heatingType: row.heating_type
    },
    pricing: {
      askingPrice: row.asking_price,
      acceptedPrice: row.accepted_price,
      monthlyFee: row.monthly_fee,
      operatingCost: row.operating_cost,
      propertyTax: row.property_tax
    },
    content: {
      title: row.title,
      shortDescription: row.short_description,
      fullDescription: row.full_description,
      features: row.features || []
    },
    images,
    metadata: {
      viewCount: row.view_count || 0,
      favoriteCount: row.favorite_count || 0,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      seoKeywords: row.seo_keywords
    }
  };
}

/**
 * Check if user has permission to access/modify property
 */
async function checkPropertyPermission(
  supabase: any, 
  userId: string, 
  propertyId: string, 
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  // For now, implement basic checks
  // In production, this would check user roles, property ownership, etc.
  
  if (action === 'read') {
    return true; // Allow all users to read published properties
  }
  
  // For write/delete, check if user is owner or admin
  const { data: property } = await supabase
    .from('properties')
    .select('created_by, status')
    .eq('id', propertyId)
    .single();
    
  if (!property) return false;
  
  // Owner can always modify their properties
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
 * Get property by ID or slug
 */
async function getPropertyByIdOrSlug(supabase: any, identifier: string) {
  // Try by UUID first
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  
  let propertyQuery;
  if (isUuid) {
    propertyQuery = supabase
      .from('properties')
      .select('*')
      .eq('id', identifier);
  } else {
    propertyQuery = supabase
      .from('properties')
      .select('*')
      .eq('slug', identifier);
  }
  
  const { data: property, error: propertyError } = await propertyQuery.single();
  
  if (propertyError || !property) {
    return { property: null, images: [], error: propertyError };
  }
  
  // Get property images
  const { data: images, error: imagesError } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', property.id)
    .order('display_order', { ascending: true });
  
  const propertyImages: PropertyImage[] = (images || []).map(img => ({
    id: img.id,
    propertyId: img.property_id,
    url: img.url,
    thumbnailUrl: img.thumbnail_url,
    caption: img.caption,
    isPrimary: img.is_primary,
    isFloorplan: img.is_floorplan,
    displayOrder: img.display_order,
    width: img.width,
    height: img.height,
    sizeBytes: img.size_bytes,
    createdAt: new Date(img.created_at)
  }));
  
  return { 
    property, 
    images: propertyImages, 
    error: imagesError 
  };
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
    const supabase = createClient();
    
    // Get current user for permission checking
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get property
    const { property, images, error } = await getPropertyByIdOrSlug(supabase, id);
    
    if (error || !property) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fastighet hittades inte'
        },
        { status: 404 }
      );
    }

    // Check read permission
    const canRead = await checkPropertyPermission(supabase, user?.id, property.id, 'read');
    if (!canRead) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att visa denna fastighet' },
        { status: 403 }
      );
    }

    // Transform to Property interface
    const propertyData = transformToProperty(property, images);

    // Increment view count if user is not the owner
    if (user?.id !== property.created_by) {
      await supabase
        .from('properties')
        .update({ view_count: (property.view_count || 0) + 1 })
        .eq('id', property.id);
      
      if (propertyData.metadata) {
        propertyData.metadata.viewCount += 1;
      }
    }

    const response: PropertyApiResponse = {
      data: propertyData,
      success: true,
      message: 'Fastighet hämtad'
    };

    return NextResponse.json(response);

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

    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att uppdatera fastigheter' },
        { status: 401 }
      );
    }

    // Check write permission
    const canWrite = await checkPropertyPermission(supabase, user.id, id, 'write');
    if (!canWrite) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att uppdatera denna fastighet' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePropertySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltiga fastighetsdata',
          errors: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // For now, return placeholder response
    // In production, this would update the property in the database
    return NextResponse.json(
      { 
        success: false, 
        message: 'Uppdatering av fastigheter implementeras senare',
        data: null
      },
      { status: 501 }
    );

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

    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad för att radera fastigheter' },
        { status: 401 }
      );
    }

    // Check delete permission
    const canDelete = await checkPropertyPermission(supabase, user.id, id, 'delete');
    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att radera denna fastighet' },
        { status: 403 }
      );
    }

    // For now, return placeholder response
    // In production, this would soft-delete or hard-delete the property
    return NextResponse.json(
      { 
        success: false, 
        message: 'Borttagning av fastigheter implementeras senare',
        data: null
      },
      { status: 501 }
    );

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