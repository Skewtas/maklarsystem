/**
 * Property Search API Route - /api/properties/search
 * 
 * Advanced search functionality with:
 * - Full-text search across multiple fields
 * - Geospatial search by coordinates/radius
 * - Faceted search with aggregations
 * - Autocomplete and suggestions
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { propertySearchSchema } from '@/lib/validation/schemas/property.schema';
import { PropertyFilterOptions } from '@/types/property.types';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

// NOTE: Temporarily simplified to avoid build-time issues. Reintroduce extended schema later.
const advancedSearchSchema = propertySearchSchema;

const autoCompleteSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['address', 'city', 'municipality', 'area']).default('address'),
  limit: z.coerce.number().int().min(1).max(20).default(10)
});

type AdvancedSearchParams = z.infer<typeof advancedSearchSchema>;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Build full-text search query using PostgreSQL's search features
 */
function buildFullTextSearch(supabase: any, query: string) {
  // Clean and prepare search query
  const searchTerms = query
    .toLowerCase()
    .replace(/[^\w\såäö]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 1)
    .join(' & ');

  if (!searchTerms) return null;

  return supabase.rpc('search_properties_full_text', {
    search_query: searchTerms
  });
}

/**
 * Build geospatial search query
 */
function buildGeospatialSearch(
  supabase: any, 
  centerLat: number, 
  centerLng: number, 
  radiusKm: number
) {
  return supabase.rpc('search_properties_by_distance', {
    center_lat: centerLat,
    center_lng: centerLng,
    radius_km: radiusKm
  });
}

/**
 * Get search suggestions and autocomplete
 */
async function getSearchSuggestions(
  supabase: any, 
  query: string, 
  type: string, 
  limit: number
) {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  switch (type) {
    case 'city':
      const { data: cities } = await supabase
        .from('properties')
        .select('city')
        .ilike('city', searchTerm)
        .not('city', 'is', null)
        .limit(limit);
      return [...new Set(cities?.map(r => r.city) || [])];
      
    case 'municipality':
      const { data: municipalities } = await supabase
        .from('properties')
        .select('municipality')
        .ilike('municipality', searchTerm)
        .not('municipality', 'is', null)
        .limit(limit);
      return [...new Set(municipalities?.map(r => r.municipality) || [])];
      
    case 'area':
      // This would search neighborhood/area data
      return [];
      
    default: // address
      const { data: addresses } = await supabase
        .from('properties')
        .select('street, city')
        .or(`street.ilike.${searchTerm},city.ilike.${searchTerm}`)
        .limit(limit);
      return addresses?.map(a => `${a.street}, ${a.city}`) || [];
  }
}

/**
 * Get faceted search aggregations
 */
async function getFacetedAggregations(supabase: any, baseQuery: any): Promise<PropertyFilterOptions> {
  // This would typically run aggregation queries
  // For now, return placeholder data
  
  return {
    propertyTypes: [
      { value: 'villa', label: 'Villa', count: 0 },
      { value: 'lagenhet', label: 'Lägenhet', count: 0 },
      { value: 'radhus', label: 'Radhus', count: 0 },
      { value: 'tomt', label: 'Tomt', count: 0 },
      { value: 'fritidshus', label: 'Fritidshus', count: 0 }
    ],
    statuses: [
      { value: 'kommande', label: 'Kommande', count: 0 },
      { value: 'till_salu', label: 'Till salu', count: 0 },
      { value: 'under_kontrakt', label: 'Under kontrakt', count: 0 },
      { value: 'sald', label: 'Såld', count: 0 }
    ],
    cities: [],
    municipalities: [],
    priceRanges: [
      { min: 0, max: 2000000, label: 'Under 2 miljoner', count: 0 },
      { min: 2000000, max: 4000000, label: '2-4 miljoner', count: 0 },
      { min: 4000000, max: 6000000, label: '4-6 miljoner', count: 0 },
      { min: 6000000, max: 10000000, label: '6-10 miljoner', count: 0 },
      { min: 10000000, max: 999999999, label: 'Över 10 miljoner', count: 0 }
    ],
    areaRanges: [
      { min: 0, max: 50, label: 'Under 50 m²', count: 0 },
      { min: 50, max: 75, label: '50-75 m²', count: 0 },
      { min: 75, max: 100, label: '75-100 m²', count: 0 },
      { min: 100, max: 150, label: '100-150 m²', count: 0 },
      { min: 150, max: 999, label: 'Över 150 m²', count: 0 }
    ],
    roomRanges: [
      { min: 1, max: 2, label: '1-2 rum', count: 0 },
      { min: 2, max: 3, label: '2-3 rum', count: 0 },
      { min: 3, max: 4, label: '3-4 rum', count: 0 },
      { min: 4, max: 5, label: '4-5 rum', count: 0 },
      { min: 5, max: 20, label: '5+ rum', count: 0 }
    ],
    buildYearRanges: [
      { min: 1800, max: 1950, label: 'Före 1950', count: 0 },
      { min: 1950, max: 1980, label: '1950-1980', count: 0 },
      { min: 1980, max: 2000, label: '1980-2000', count: 0 },
      { min: 2000, max: 2020, label: '2000-2020', count: 0 },
      { min: 2020, max: new Date().getFullYear(), label: 'Efter 2020', count: 0 }
    ]
  };
}

// ============================================================
// API HANDLERS
// ============================================================

/**
 * GET /api/properties/search
 * Advanced property search with full-text, geospatial, and faceted search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    // Parse array parameters
    if (rawParams.propertyTypes) {
      rawParams.propertyTypes = rawParams.propertyTypes.split(',');
    }
    if (rawParams.statuses) {
      rawParams.statuses = rawParams.statuses.split(',');
    }
    if (rawParams.facets) {
      rawParams.facets = rawParams.facets.split(',');
    }

    // Handle autocomplete requests
    if (rawParams.autocomplete === 'true') {
      const autoCompleteResult = autoCompleteSchema.safeParse(rawParams);
      if (!autoCompleteResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Ogiltiga autocomplete-parametrar',
            errors: autoCompleteResult.error.issues
          },
          { status: 400 }
        );
      }

      const { q, type, limit } = autoCompleteResult.data;
      const supabase = createClient();
      const suggestions = await getSearchSuggestions(supabase, q, type, limit);

      return NextResponse.json({
        success: true,
        data: suggestions,
        message: `Hittade ${suggestions.length} förslag`
      });
    }

    // Validate search parameters
    const searchResult = advancedSearchSchema.safeParse(rawParams);
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

    const params = searchResult.data;
    const supabase = createClient();

    // Handle suggestions-only requests
    if (params.suggestionsOnly && params.query) {
      const suggestions = await getSearchSuggestions(
        supabase, 
        params.query, 
        'address', 
        10
      );
      
      return NextResponse.json({
        success: true,
        data: { suggestions },
        message: 'Sökförslag'
      });
    }

    // Build search query
    let searchQuery;
    
    // Full-text search
    if (params.query) {
      searchQuery = buildFullTextSearch(supabase, params.query);
      if (!searchQuery) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Inga resultat hittades'
        });
      }
    }

    // Geospatial search
    if (params.centerLat && params.centerLng && params.radiusKm) {
      const geoQuery = buildGeospatialSearch(
        supabase,
        params.centerLat,
        params.centerLng,
        params.radiusKm
      );
      
      // If we have both text and geo search, we'd need to combine them
      searchQuery = searchQuery ? searchQuery : geoQuery;
    }

    // If no specific search method, fall back to regular property listing
    if (!searchQuery) {
      return NextResponse.json({
        success: true,
        data: [],
        facets: params.includeAggregations ? await getFacetedAggregations(supabase, null) : undefined,
        message: 'Inga sökkriterier angivna'
      });
    }

    // For now, return placeholder since we need to implement the RPC functions
    return NextResponse.json({
      success: false,
      message: 'Avancerad sökning implementeras senare med PostgreSQL full-text search',
      data: [],
      facets: params.includeAggregations ? await getFacetedAggregations(supabase, null) : undefined
    }, { status: 501 });

  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid avancerad sökning',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/search
 * Complex search with request body for large filter sets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This would handle complex search requests sent via POST body
    // Useful for large filter sets that exceed URL length limits
    
    return NextResponse.json({
      success: false,
      message: 'POST-baserad sökning implementeras senare',
      data: []
    }, { status: 501 });

  } catch (error) {
    console.error('Search POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internt serverfel vid sökning',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}