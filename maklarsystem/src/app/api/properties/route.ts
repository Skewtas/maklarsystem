/**
 * Properties API Route - GET /api/properties
 * 
 * Handles property listing with search, filtering, pagination, and sorting
 * following Swedish real estate conventions.
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { propertySearchSchema } from '@/lib/validation/schemas/property.schema';
import { PropertyListApiResponse, PropertyListItem } from '@/types/property.types';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['price', 'area', 'rooms', 'buildYear', 'publishedAt', 'title']).default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

type PaginationParams = z.infer<typeof paginationSchema>;
type SearchParams = z.infer<typeof propertySearchSchema>;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Build PostgreSQL query with filters
 */
function buildPropertyQuery(supabase: any, filters: SearchParams & PaginationParams) {
  let query = supabase
    .from('properties')
    .select(`
      id,
      slug,
      fastighetsbeteckning,
      property_type,
      status,
      title,
      short_description,
      street,
      city,
      postal_code,
      living_area,
      rooms,
      build_year,
      plot_area,
      asking_price,
      accepted_price,
      published_at,
      view_count,
      created_at,
      updated_at,
      property_images!inner(
        id,
        url,
        thumbnail_url,
        caption,
        is_primary,
        display_order
      )
    `);

  // Text search across multiple fields
  if (filters.query) {
    const searchQuery = `%${filters.query.toLowerCase()}%`;
    query = query.or(`
      title.ilike.${searchQuery},
      short_description.ilike.${searchQuery},
      street.ilike.${searchQuery},
      city.ilike.${searchQuery},
      fastighetsbeteckning.ilike.${searchQuery}
    `);
  }

  // Property types filter
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    query = query.in('property_type', filters.propertyTypes);
  }

  // Status filter
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in('status', filters.statuses);
  }

  // Price range filters
  if (filters.priceMin !== undefined) {
    query = query.gte('asking_price', filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    query = query.lte('asking_price', filters.priceMax);
  }

  // Area range filters
  if (filters.areaMin !== undefined) {
    query = query.gte('living_area', filters.areaMin);
  }
  if (filters.areaMax !== undefined) {
    query = query.lte('living_area', filters.areaMax);
  }

  // Rooms range filters
  if (filters.roomsMin !== undefined) {
    query = query.gte('rooms', filters.roomsMin);
  }
  if (filters.roomsMax !== undefined) {
    query = query.lte('rooms', filters.roomsMax);
  }

  // Build year range filters
  if (filters.buildYearMin !== undefined) {
    query = query.gte('build_year', filters.buildYearMin);
  }
  if (filters.buildYearMax !== undefined) {
    query = query.lte('build_year', filters.buildYearMax);
  }

  // Location filters
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.municipality) {
    query = query.ilike('municipality', `%${filters.municipality}%`);
  }

  return query;
}

/**
 * Transform database row to PropertyListItem
 */
function transformToPropertyListItem(row: any): PropertyListItem {
  const now = new Date();
  const publishedAt = row.published_at ? new Date(row.published_at) : null;
  const daysSincePublished = publishedAt 
    ? Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Get primary image
  const primaryImage = row.property_images?.find((img: any) => img.is_primary) || row.property_images?.[0];

  // Calculate price per sqm
  const pricePerSqm = row.asking_price && row.living_area 
    ? Math.round(row.asking_price / row.living_area)
    : 0;

  return {
    id: row.id,
    slug: row.slug,
    fastighetsbeteckning: row.fastighetsbeteckning,
    propertyType: row.property_type,
    status: row.status,
    title: row.title,
    shortDescription: row.short_description,
    street: row.street,
    city: row.city,
    postalCode: row.postal_code,
    livingArea: row.living_area,
    rooms: row.rooms,
    buildYear: row.build_year,
    plotArea: row.plot_area,
    askingPrice: row.asking_price,
    acceptedPrice: row.accepted_price,
    pricePerSqm,
    primaryImage: primaryImage ? {
      id: primaryImage.id,
      propertyId: row.id,
      url: primaryImage.url,
      thumbnailUrl: primaryImage.thumbnail_url,
      caption: primaryImage.caption,
      isPrimary: primaryImage.is_primary,
      isFloorplan: false,
      displayOrder: primaryImage.display_order,
      createdAt: new Date(primaryImage.created_at || row.created_at)
    } : undefined,
    imageCount: row.property_images?.length || 0,
    publishedAt,
    viewCount: row.view_count || 0,
    isNew: daysSincePublished <= 7,
    daysSincePublished,
    formattedPrice: new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(row.asking_price || 0),
    formattedArea: `${row.living_area || 0} m²`,
    formattedRooms: row.rooms ? `${row.rooms} ${row.rooms === 1 ? 'rum' : 'rum'}` : '- rum'
  };
}

/**
 * Rate limiting middleware
 */
async function checkRateLimit(request: NextRequest): Promise<boolean> {
  // Implement rate limiting logic here
  // For now, return true (no limits)
  return true;
}

// ============================================================
// API HANDLER
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Check rate limits
    const isAllowed = await checkRateLimit(request);
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, message: 'För många förfrågningar. Försök igen senare.' },
        { status: 429 }
      );
    }

    // Parse and validate search parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    // Parse array parameters
    if (rawParams.propertyTypes) {
      rawParams.propertyTypes = rawParams.propertyTypes.split(',');
    }
    if (rawParams.statuses) {
      rawParams.statuses = rawParams.statuses.split(',');
    }

    // Validate pagination parameters
    const paginationResult = paginationSchema.safeParse(rawParams);
    if (!paginationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltiga paginering-parametrar',
          errors: paginationResult.error.issues
        },
        { status: 400 }
      );
    }

    // Validate search parameters
    const searchResult = propertySearchSchema.safeParse(rawParams);
    if (!searchResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ogiltiga sökparametrar',
          errors: searchResult.error.issues
        },
        { status: 400 }
      );
    }

    const paginationParams = paginationResult.data;
    const validatedSearchParams = searchResult.data;
    const allParams = { ...validatedSearchParams, ...paginationParams };

    // Initialize Supabase client
    const supabase = createClient();

    // Build and execute the query
    let query = buildPropertyQuery(supabase, allParams);
    
    // Add sorting
    const sortColumn = {
      price: 'asking_price',
      area: 'living_area', 
      rooms: 'rooms',
      buildYear: 'build_year',
      publishedAt: 'published_at',
      title: 'title'
    }[allParams.sortBy] || 'published_at';

    query = query.order(sortColumn, { ascending: allParams.sortOrder === 'asc' });

    // Get total count for pagination
    const { count } = await buildPropertyQuery(supabase, allParams)
      .select('id', { count: 'exact' });

    // Add pagination
    const offset = (allParams.page - 1) * allParams.limit;
    query = query.range(offset, offset + allParams.limit - 1);

    // Execute query
    const { data: properties, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fel vid hämtning av fastigheter från databasen',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // Transform data
    const propertyListItems: PropertyListItem[] = (properties || []).map(transformToPropertyListItem);

    // Calculate pagination info
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / allParams.limit);
    const hasNextPage = allParams.page < totalPages;
    const hasPreviousPage = allParams.page > 1;

    // Build response
    const response: PropertyListApiResponse = {
      data: propertyListItems,
      pagination: {
        currentPage: allParams.page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        pageSize: allParams.limit
      },
      filters: validatedSearchParams,
      statistics: {
        total: totalCount,
        byStatus: {
          kommande: 0,
          till_salu: 0,
          under_kontrakt: 0,
          sald: 0
        },
        byType: {
          villa: 0,
          lagenhet: 0,
          radhus: 0,
          tomt: 0,
          fritidshus: 0
        },
        averagePrice: 0,
        averageArea: 0,
        averagePricePerSqm: 0,
        totalValue: 0,
        recentlyAdded: 0,
        recentlyUpdated: 0
      },
      success: true,
      message: `Hittade ${totalCount} ${totalCount === 1 ? 'fastighet' : 'fastigheter'}`
    };

    // Calculate statistics if we have properties
    if (propertyListItems.length > 0) {
      const stats = response.statistics!;
      
      // Count by status and type
      propertyListItems.forEach(property => {
        stats.byStatus[property.status]++;
        stats.byType[property.propertyType]++;
      });

      // Calculate averages
      const totalPrice = propertyListItems.reduce((sum, p) => sum + p.askingPrice, 0);
      const totalArea = propertyListItems.reduce((sum, p) => sum + p.livingArea, 0);
      const totalPricePerSqm = propertyListItems.reduce((sum, p) => sum + p.pricePerSqm, 0);

      stats.averagePrice = totalPrice / propertyListItems.length;
      stats.averageArea = totalArea / propertyListItems.length;
      stats.averagePricePerSqm = totalPricePerSqm / propertyListItems.length;
      stats.totalValue = totalPrice;
      stats.recentlyAdded = propertyListItems.filter(p => p.isNew).length;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid hämtning av fastigheter',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests to create new properties
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Otillåten. Du måste vara inloggad för att skapa fastigheter.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // This would use createPropertySchema validation
    // For now, return a placeholder response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Skapande av fastigheter implementeras senare',
        data: null
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid skapande av fastighet',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}