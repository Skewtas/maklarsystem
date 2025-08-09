/**
 * Property Validation Schema
 * 
 * Comprehensive Zod validation schemas for Swedish real estate properties
 * following the PRP specification with Swedish format validators.
 */

import { z } from 'zod';
import { 
  fastighetsbeteckningValidator,
  postnummerValidator,
  formatPostnummer
} from '../validators/swedish.validators';

// ============================================================
// ENUM DEFINITIONS
// ============================================================

export const propertyTypeEnum = z.enum([
  'villa',
  'lagenhet', 
  'radhus',
  'tomt',
  'fritidshus'
]);

export const propertyStatusEnum = z.enum([
  'kommande',
  'till_salu',
  'under_kontrakt', 
  'sald'
]);

// ============================================================
// SUB-SCHEMAS
// ============================================================

/**
 * Swedish name validator (for cities, municipalities, etc.)
 */
const swedishNameSchema = z.string()
  .refine((value) => {
    // Allow Swedish letters, spaces, hyphens, and apostrophes
    const pattern = /^[a-zA-ZåäöÅÄÖ\s\-']+$/;
    return pattern.test(value.trim());
  }, {
    message: 'Får endast innehålla bokstäver, mellanslag, bindestreck och apostrofer'
  })
  .transform((val) => val.trim());

/**
 * Coordinates validator for Swedish geographical coordinates
 */
const coordinatesSchema = z.object({
  lat: z.number()
    .min(55.0, 'Latitud måste vara inom Sverige (55.0-69.1)')
    .max(69.1, 'Latitud måste vara inom Sverige (55.0-69.1)'),
  lng: z.number()
    .min(10.0, 'Longitud måste vara inom Sverige (10.0-24.2)')
    .max(24.2, 'Longitud måste vara inom Sverige (10.0-24.2)')
});

/**
 * Swedish postal code validator with formatting
 */
const postnummerSchema = z.string()
  .refine(postnummerValidator, 'Ogiltigt postnummer (format: XXX XX)')
  .transform(formatPostnummer);

/**
 * Enhanced fastighetsbeteckning validator
 */
const fastighetsbeteckningSchema = z.string()
  .min(1, 'Fastighetsbeteckning krävs')
  .refine(fastighetsbeteckningValidator, 'Ogiltig fastighetsbeteckning (format: Kommun Trakt Block:Enhet)');

/**
 * Address schema with Swedish validation
 */
export const addressSchema = z.object({
  street: z.string()
    .min(3, 'Gatuadress måste vara minst 3 tecken')
    .max(255, 'Gatuadress får vara max 255 tecken'),
  
  postalCode: postnummerSchema,
  
  city: z.string()
    .min(2, 'Ort måste vara minst 2 tecken')
    .max(100, 'Ort får vara max 100 tecken')
    .pipe(swedishNameSchema),
  
  municipality: z.string()
    .max(100, 'Kommun får vara max 100 tecken')
    .pipe(swedishNameSchema)
    .optional(),
  
  county: z.string()
    .max(100, 'Län får vara max 100 tecken')
    .pipe(swedishNameSchema)
    .optional(),
  
  coordinates: coordinatesSchema.optional()
});

/**
 * Property specifications schema
 */
export const specificationsSchema = z.object({
  livingArea: z.number()
    .min(1, 'Boarea måste vara minst 1 m²')
    .max(10000, 'Kontrollera boarea - verkar för stor')
    .int('Boarea anges i hela kvadratmeter'),
  
  supplementaryArea: z.number()
    .min(0, 'Biarea kan inte vara negativ')
    .max(10000, 'Kontrollera biarea - verkar för stor')
    .int('Biarea anges i hela kvadratmeter')
    .optional(),
  
  plotArea: z.number()
    .min(0, 'Tomtarea kan inte vara negativ')
    .max(1000000, 'Kontrollera tomtarea - verkar för stor')
    .int('Tomtarea anges i hela kvadratmeter')
    .optional(),
  
  rooms: z.number()
    .min(0.5, 'Antal rum måste vara minst 0.5')
    .max(20, 'Kontrollera antal rum - verkar för många')
    .multipleOf(0.5, 'Antal rum anges i halva rum (ex: 3.5)'),
  
  bathrooms: z.number()
    .min(0, 'Antal badrum kan inte vara negativt')
    .max(10, 'Kontrollera antal badrum')
    .int('Antal badrum anges i hela rum')
    .optional(),
  
  buildYear: z.number()
    .min(1800, 'Byggår verkar för gammalt')
    .max(new Date().getFullYear() + 5, 'Byggår kan inte vara så långt fram i tiden')
    .int('Byggår anges som helt år'),
  
  floors: z.number()
    .min(1, 'Antal våningar måste vara minst 1')
    .max(50, 'Kontrollera antal våningar')
    .int('Antal våningar anges som helt antal')
    .optional()
});

/**
 * Pricing schema with SEK validation
 */
export const pricingSchema = z.object({
  askingPrice: z.number()
    .min(0, 'Utgångspris kan inte vara negativt')
    .max(1000000000, 'Kontrollera utgångspris - verkar för högt')
    .int('Pris anges i hela kronor'),
  
  acceptedPrice: z.number()
    .min(0, 'Accepterat pris kan inte vara negativt')
    .max(1000000000, 'Kontrollera accepterat pris')
    .int('Pris anges i hela kronor')
    .optional()
    .nullable(),
  
  monthlyFee: z.number()
    .min(0, 'Månadsavgift kan inte vara negativ')
    .max(100000, 'Kontrollera månadsavgift')
    .int('Avgift anges i hela kronor')
    .optional(),
  
  operatingCost: z.number()
    .min(0, 'Driftskostnad kan inte vara negativ')
    .max(1000000, 'Kontrollera driftskostnad')
    .int('Kostnad anges i hela kronor')
    .optional()
});

/**
 * Content schema for descriptions and marketing text
 */
export const contentSchema = z.object({
  title: z.string()
    .min(10, 'Rubrik måste vara minst 10 tecken')
    .max(255, 'Rubrik får vara max 255 tecken')
    .regex(/^[a-zA-ZåäöÅÄÖ0-9\s\-,.!?()]+$/, 'Rubrik innehåller ogiltiga tecken'),
  
  shortDescription: z.string()
    .max(200, 'Kort beskrivning får vara max 200 tecken')
    .optional(),
  
  fullDescription: z.string()
    .min(50, 'Fullständig beskrivning måste vara minst 50 tecken')
    .max(10000, 'Fullständig beskrivning får vara max 10000 tecken'),
  
  features: z.array(z.string().max(100))
    .max(20, 'Max 20 särdrag kan anges')
    .optional()
});

/**
 * Metadata schema for system fields
 */
export const metadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional().nullable(),
  createdBy: z.string().uuid('Ogiltig användar-ID'),
  responsibleAgent: z.string().uuid('Ogiltig mäklar-ID'),
  viewCount: z.number().int().min(0).default(0).optional()
});

// ============================================================
// MAIN PROPERTY SCHEMA
// ============================================================

/**
 * Base object schema (ZodObject) used for omit/extend operations
 */
const propertyBaseSchema = z.object({
  // Identification
  id: z.string().uuid('Ogiltig objekt-ID').optional(),
  fastighetsbeteckning: fastighetsbeteckningSchema,
  slug: z.string()
    .min(3, 'Slug måste vara minst 3 tecken')
    .max(255, 'Slug får vara max 255 tecken')
    .regex(/^[a-z0-9-]+$/, 'Slug får endast innehålla små bokstäver, siffror och bindestreck')
    .optional(), // Generated automatically
  
  // Basic Info
  propertyType: propertyTypeEnum,
  status: propertyStatusEnum.default('kommande'),
  
  // Nested objects
  address: addressSchema,
  specifications: specificationsSchema,
  pricing: pricingSchema,
  content: contentSchema,
  metadata: metadataSchema.optional() // Only for read operations
});

/**
 * Complete property schema with business rule refinements
 */
export const propertySchema = propertyBaseSchema
  .refine((data) => {
    // Validate that monthly fee is only for apartments
    if (data.pricing.monthlyFee && data.propertyType !== 'lagenhet') {
      return false;
    }
    return true;
  }, {
    message: 'Månadsavgift anges endast för lägenheter',
    path: ['pricing', 'monthlyFee']
  })
  .refine((data) => {
    // Validate that plot area is not for apartments
    if (data.specifications.plotArea && data.propertyType === 'lagenhet') {
      return false;
    }
    return true;
  }, {
    message: 'Tomtarea anges inte för lägenheter',
    path: ['specifications', 'plotArea']
  });

// ============================================================
// PARTIAL SCHEMAS FOR DIFFERENT USE CASES
// ============================================================

/**
 * Schema for creating new property (no ID or metadata)
 */
export const createPropertySchema = propertyBaseSchema.omit({ 
  id: true, 
  slug: true, 
  metadata: true 
});

/**
 * Schema for updating property (all fields optional except required business fields)
 */
export const updatePropertySchema = propertyBaseSchema.omit({ 
  metadata: true 
}).partial().extend({
  id: z.string().uuid('Ogiltig objekt-ID'),
  // Keep these as required for business logic
  fastighetsbeteckning: fastighetsbeteckningSchema,
  propertyType: propertyTypeEnum
});

/**
 * Schema for property search/filtering
 */
export const propertySearchSchema = z.object({
  // Text search
  query: z.string().max(100).optional(),
  
  // Filters
  propertyType: propertyTypeEnum.optional(),
  status: propertyStatusEnum.optional(),
  city: z.string().max(100).optional(),
  municipality: z.string().max(100).optional(),
  
  // Price range
  minPrice: z.number().min(0).int().optional(),
  maxPrice: z.number().min(0).int().optional(),
  
  // Area range
  minLivingArea: z.number().min(0).int().optional(),
  maxLivingArea: z.number().min(0).int().optional(),
  
  // Rooms range
  minRooms: z.number().min(0.5).multipleOf(0.5).optional(),
  maxRooms: z.number().min(0.5).multipleOf(0.5).optional(),
  
  // Build year range
  minBuildYear: z.number().int().optional(),
  maxBuildYear: z.number().int().optional(),
  
  // Sorting
  sortBy: z.enum(['price', 'date', 'area', 'rooms']).default('date').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  
  // Pagination
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional()
})
.refine((data) => {
  // Validate price range
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    return false;
  }
  return true;
}, {
  message: 'Minpris kan inte vara högre än maxpris',
  path: ['minPrice']
})
.refine((data) => {
  // Validate area range
  if (data.minLivingArea && data.maxLivingArea && data.minLivingArea > data.maxLivingArea) {
    return false;
  }
  return true;
}, {
  message: 'Minarea kan inte vara större än maxarea',
  path: ['minLivingArea']
})
.refine((data) => {
  // Validate rooms range
  if (data.minRooms && data.maxRooms && data.minRooms > data.maxRooms) {
    return false;
  }
  return true;
}, {
  message: 'Minantal rum kan inte vara fler än maxantal rum',
  path: ['minRooms']
});

/**
 * Schema for property list response
 */
export const propertyListResponseSchema = z.object({
  properties: z.array(propertySchema),
  pagination: z.object({
    currentPage: z.number().int().min(1),
    totalPages: z.number().int().min(0),
    totalCount: z.number().int().min(0),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean()
  }),
  filters: propertySearchSchema.optional()
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type PropertySearchParams = z.infer<typeof propertySearchSchema>;
export type PropertyListResponse = z.infer<typeof propertyListResponseSchema>;
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PropertyAddress = z.infer<typeof addressSchema>;
export type PropertySpecifications = z.infer<typeof specificationsSchema>;
export type PropertyPricing = z.infer<typeof pricingSchema>;
export type PropertyContent = z.infer<typeof contentSchema>;
export type PropertyMetadata = z.infer<typeof metadataSchema>;