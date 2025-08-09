/**
 * Property Type Definitions
 * 
 * TypeScript interfaces and types for Swedish real estate properties
 * following the PRP specification.
 */

import { z } from 'zod';
import { 
  propertySchema,
  createPropertySchema,
  updatePropertySchema,
  propertySearchSchema,
  propertyListResponseSchema,
  addressSchema,
  specificationsSchema,
  pricingSchema,
  contentSchema,
  metadataSchema,
  propertyTypeEnum,
  propertyStatusEnum
} from '@/lib/validation/schemas/property.schema';

// ============================================================
// BASE TYPES FROM SCHEMAS
// ============================================================

export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type PropertySearchParams = z.infer<typeof propertySearchSchema>;
export type PropertyListResponse = z.infer<typeof propertyListResponseSchema>;

// Sub-types
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PropertyAddress = z.infer<typeof addressSchema>;
export type PropertySpecifications = z.infer<typeof specificationsSchema>;
export type PropertyPricing = z.infer<typeof pricingSchema>;
export type PropertyContent = z.infer<typeof contentSchema>;
export type PropertyMetadata = z.infer<typeof metadataSchema>;

// ============================================================
// EXTENDED TYPES FOR UI COMPONENTS
// ============================================================

/**
 * Property with calculated fields for display
 */
export interface PropertyWithCalculated extends Property {
  // Calculated display values
  pricePerSqm: number;
  formattedPrice: string;
  formattedArea: string;
  formattedRooms: string;
  fullAddress: string;
  isNew: boolean;
  daysSincePublished: number;
  
  // SEO and URL
  url: string;
  metaDescription: string;
  
  // Images
  primaryImage?: PropertyImage;
  imageCount: number;
}

/**
 * Property image interface
 */
export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  isPrimary: boolean;
  isFloorplan: boolean;
  displayOrder: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  createdAt: Date;
}

/**
 * Property form state for multi-step wizard
 */
export interface PropertyFormState {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  isDirty: boolean;
  data: Partial<CreatePropertyData>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
}

/**
 * Property form step definition
 */
export interface PropertyFormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  isRequired: boolean;
  isValid: boolean;
  canSkip: boolean;
}

/**
 * Property filter options for search UI
 */
export interface PropertyFilterOptions {
  propertyTypes: Array<{ value: PropertyType; label: string; count: number }>;
  statuses: Array<{ value: PropertyStatus; label: string; count: number }>;
  cities: Array<{ value: string; label: string; count: number }>;
  municipalities: Array<{ value: string; label: string; count: number }>;
  priceRanges: Array<{ min: number; max: number; label: string; count: number }>;
  areaRanges: Array<{ min: number; max: number; label: string; count: number }>;
  roomRanges: Array<{ min: number; max: number; label: string; count: number }>;
  buildYearRanges: Array<{ min: number; max: number; label: string; count: number }>;
}

/**
 * Property list item for card display
 */
export interface PropertyListItem {
  id: string;
  slug: string;
  fastighetsbeteckning: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  title: string;
  shortDescription?: string;
  
  // Address
  street: string;
  city: string;
  postalCode: string;
  
  // Key specs
  livingArea: number;
  rooms: number;
  buildYear: number;
  plotArea?: number;
  
  // Pricing
  askingPrice: number;
  acceptedPrice?: number;
  pricePerSqm: number;
  
  // Images
  primaryImage?: PropertyImage;
  imageCount: number;
  
  // Metadata
  publishedAt?: Date;
  viewCount: number;
  
  // Calculated
  isNew: boolean;
  daysSincePublished: number;
  formattedPrice: string;
  formattedArea: string;
  formattedRooms: string;
}

/**
 * Property card variant types
 */
export type PropertyCardVariant = 'default' | 'compact' | 'detailed' | 'grid';

/**
 * Property sort options
 */
export interface PropertySortOption {
  value: string;
  label: string;
  field: keyof Property;
  direction: 'asc' | 'desc';
}

/**
 * Property statistics for dashboard
 */
export interface PropertyStatistics {
  total: number;
  byStatus: Record<PropertyStatus, number>;
  byType: Record<PropertyType, number>;
  averagePrice: number;
  averageArea: number;
  averagePricePerSqm: number;
  totalValue: number;
  recentlyAdded: number; // Last 30 days
  recentlyUpdated: number; // Last 7 days
}

/**
 * Property validation errors
 */
export interface PropertyValidationErrors {
  [key: string]: string[] | PropertyValidationErrors;
}

/**
 * Property API response types
 */
export interface PropertyApiResponse<T = Property> {
  data: T;
  success: boolean;
  message?: string;
  errors?: PropertyValidationErrors;
}

export interface PropertyListApiResponse {
  data: PropertyListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
  };
  filters?: PropertySearchParams;
  statistics?: PropertyStatistics;
  success: boolean;
  message?: string;
}

/**
 * Property image upload response
 */
export interface PropertyImageUploadResponse {
  data: PropertyImage;
  success: boolean;
  message?: string;
  errors?: string[];
}

/**
 * Property bulk operation response
 */
export interface PropertyBulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// ============================================================
// FORM INTERFACES
// ============================================================

/**
 * Property form props
 */
export interface PropertyFormProps {
  initialData?: Partial<CreatePropertyData>;
  propertyId?: string;
  onSubmit: (data: CreatePropertyData) => Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (data: Partial<CreatePropertyData>) => Promise<void>;
  readonly?: boolean;
  className?: string;
}

/**
 * Property form step props
 */
export interface PropertyFormStepProps<T = any> {
  data: T;
  errors: PropertyValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: string, value: any) => void;
  onBlur: (field: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canContinue: boolean;
  isSubmitting: boolean;
  readonly?: boolean;
}

/**
 * Property search props
 */
export interface PropertySearchProps {
  initialFilters?: Partial<PropertySearchParams>;
  onSearch: (params: PropertySearchParams) => void;
  onReset: () => void;
  filterOptions?: PropertyFilterOptions;
  isLoading?: boolean;
  className?: string;
}

/**
 * Property card props
 */
export interface PropertyCardProps {
  property: PropertyListItem;
  variant?: PropertyCardVariant;
  showImages?: boolean;
  showActions?: boolean;
  onClick?: (property: PropertyListItem) => void;
  onFavorite?: (propertyId: string) => void;
  onShare?: (property: PropertyListItem) => void;
  className?: string;
}

/**
 * Property gallery props for advanced image viewing
 */
export interface PropertyGalleryProps {
  images: PropertyImage[];
  title?: string;
  viewMode?: 'grid' | 'list' | 'masonry';
  columns?: 1 | 2 | 3 | 4;
  aspectRatio?: 'square' | 'video' | 'auto';
  showThumbnails?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  onImageClick?: (image: PropertyImage, index: number) => void;
  onShare?: (image: PropertyImage) => void;
  onDownload?: (image: PropertyImage) => void;
  className?: string;
}

/**
 * Property image manager props for upload and management
 */
export interface PropertyImageManagerProps {
  propertyId: string;
  images: PropertyImage[];
  onUpload: (files: File[]) => Promise<void>;
  onReorder: (imageIds: string[]) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  onSetPrimary: (imageId: string) => Promise<void>;
  onUpdateCaption: (imageId: string, caption: string) => Promise<void>;
  maxImages?: number;
  readonly?: boolean;
  className?: string;
}

// ============================================================
// HOOK RETURN TYPES
// ============================================================

/**
 * useProperty hook return type
 */
export interface UsePropertyReturn {
  property: Property | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  update: (data: Partial<UpdatePropertyData>) => Promise<Property>;
  remove: () => Promise<void>;
}

/**
 * useProperties hook return type
 */
export interface UsePropertiesReturn {
  properties: PropertyListItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pagination: PropertyListApiResponse['pagination'];
  filters: PropertySearchParams;
  statistics?: PropertyStatistics;
  refetch: () => void;
  search: (params: Partial<PropertySearchParams>) => void;
  resetFilters: () => void;
}

/**
 * usePropertyForm hook return type
 */
export interface UsePropertyFormReturn {
  formState: PropertyFormState;
  currentStepData: any;
  steps: PropertyFormStep[];
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateField: (field: string, value: any) => void;
  validateStep: (step?: number) => boolean;
  validateAll: () => boolean;
  saveDraft: () => Promise<void>;
  submitForm: () => Promise<Property>;
  resetForm: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

// ============================================================
// UTILITY TYPES
// ============================================================

/**
 * Swedish property type labels
 */
export const PropertyTypeLabels: Record<PropertyType, string> = {
  villa: 'Villa',
  lagenhet: 'Lägenhet',
  radhus: 'Radhus',
  tomt: 'Tomt',
  fritidshus: 'Fritidshus'
};

/**
 * Swedish property status labels
 */
export const PropertyStatusLabels: Record<PropertyStatus, string> = {
  kommande: 'Kommande',
  till_salu: 'Till salu',
  under_kontrakt: 'Under kontrakt',
  sald: 'Såld'
};

/**
 * Property status colors for UI
 */
export const PropertyStatusColors: Record<PropertyStatus, string> = {
  kommande: 'orange',
  till_salu: 'green',
  under_kontrakt: 'yellow',
  sald: 'red'
};

/**
 * Property type icons
 */
export const PropertyTypeIcons: Record<PropertyType, string> = {
  villa: 'home',
  lagenhet: 'building',
  radhus: 'buildings',
  tomt: 'map',
  fritidshus: 'trees'
};