/**
 * Property Utility Functions
 * 
 * Helper functions for Swedish real estate properties including
 * formatting, calculations, and data transformations.
 */

import { 
  Property, 
  PropertyType, 
  PropertyStatus, 
  PropertyListItem, 
  PropertyWithCalculated,
  PropertyTypeLabels,
  PropertyStatusLabels 
} from '@/types/property.types';

// ============================================================
// FORMATTING FUNCTIONS
// ============================================================

/**
 * Format Swedish currency (SEK)
 */
export function formatSEK(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format area in square meters with Swedish conventions
 */
export function formatArea(sqm: number): string {
  return `${sqm.toLocaleString('sv-SE')} m²`;
}

/**
 * Format room count with Swedish conventions
 */
export function formatRooms(rooms: number): string {
  if (rooms === 1) return '1 rum';
  if (Math.floor(rooms) === rooms) return `${rooms} rum`;
  
  const whole = Math.floor(rooms);
  const fraction = rooms - whole;
  
  if (fraction === 0.5) {
    return `${whole},5 rum`;
  }
  
  return `${rooms.toString().replace('.', ',')} rum`;
}

/**
 * Format Swedish date
 */
export function formatSwedishDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
}

/**
 * Format relative time in Swedish
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 30) {
    return formatSwedishDate(dateObj);
  } else if (diffDays > 1) {
    return `${diffDays} dagar sedan`;
  } else if (diffDays === 1) {
    return 'igår';
  } else if (diffHours > 1) {
    return `${diffHours} timmar sedan`;
  } else if (diffMinutes > 1) {
    return `${diffMinutes} minuter sedan`;
  } else {
    return 'just nu';
  }
}

/**
 * Format property type label in Swedish
 */
export function formatPropertyType(type: PropertyType): string {
  return PropertyTypeLabels[type];
}

/**
 * Format property status label in Swedish
 */
export function formatPropertyStatus(status: PropertyStatus): string {
  return PropertyStatusLabels[status];
}

/**
 * Format full address as single string
 */
export function formatAddress(
  street: string, 
  postalCode: string, 
  city: string
): string {
  return `${street}, ${postalCode} ${city}`;
}

// ============================================================
// CALCULATION FUNCTIONS
// ============================================================

/**
 * Calculate price per square meter
 */
export function calculatePricePerSqm(price: number, area: number): number {
  if (area === 0) return 0;
  return Math.round(price / area);
}

/**
 * Calculate days since published
 */
export function calculateDaysSincePublished(publishedAt?: Date | string): number {
  if (!publishedAt) return 0;
  
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if property is new (published within last 7 days)
 */
export function isNewProperty(publishedAt?: Date | string): boolean {
  return calculateDaysSincePublished(publishedAt) <= 7;
}

/**
 * Calculate property value appreciation/depreciation
 */
export function calculatePriceChange(
  askingPrice: number, 
  acceptedPrice?: number | null
): { amount: number; percentage: number; type: 'increase' | 'decrease' | 'same' } {
  if (!acceptedPrice) {
    return { amount: 0, percentage: 0, type: 'same' };
  }

  const difference = acceptedPrice - askingPrice;
  const percentage = (difference / askingPrice) * 100;

  return {
    amount: difference,
    percentage: Math.abs(percentage),
    type: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'same'
  };
}

// ============================================================
// TRANSFORMATION FUNCTIONS
// ============================================================

/**
 * Transform Property to PropertyListItem
 */
export function transformToListItem(property: Property): PropertyListItem {
  const pricePerSqm = calculatePricePerSqm(
    property.pricing.askingPrice, 
    property.specifications.livingArea
  );
  
  const daysSincePublished = calculateDaysSincePublished(property.metadata?.publishedAt);
  
  return {
    id: property.id!,
    slug: property.slug!,
    fastighetsbeteckning: property.fastighetsbeteckning,
    propertyType: property.propertyType,
    status: property.status,
    title: property.content.title,
    shortDescription: property.content.shortDescription,
    
    // Address
    street: property.address.street,
    city: property.address.city,
    postalCode: property.address.postalCode,
    
    // Key specs
    livingArea: property.specifications.livingArea,
    rooms: property.specifications.rooms,
    buildYear: property.specifications.buildYear,
    plotArea: property.specifications.plotArea,
    
    // Pricing
    askingPrice: property.pricing.askingPrice,
    acceptedPrice: property.pricing.acceptedPrice,
    pricePerSqm,
    
    // Images (will be populated by component)
    imageCount: 0,
    
    // Metadata
    publishedAt: property.metadata?.publishedAt,
    viewCount: property.metadata?.viewCount || 0,
    
    // Calculated
    isNew: isNewProperty(property.metadata?.publishedAt),
    daysSincePublished,
    formattedPrice: formatSEK(property.pricing.askingPrice),
    formattedArea: formatArea(property.specifications.livingArea),
    formattedRooms: formatRooms(property.specifications.rooms)
  };
}

/**
 * Transform Property to PropertyWithCalculated
 */
export function transformToCalculated(property: Property): PropertyWithCalculated {
  const pricePerSqm = calculatePricePerSqm(
    property.pricing.askingPrice, 
    property.specifications.livingArea
  );
  
  const daysSincePublished = calculateDaysSincePublished(property.metadata?.publishedAt);
  const fullAddress = formatAddress(
    property.address.street,
    property.address.postalCode,
    property.address.city
  );

  return {
    ...property,
    pricePerSqm,
    formattedPrice: formatSEK(property.pricing.askingPrice),
    formattedArea: formatArea(property.specifications.livingArea),
    formattedRooms: formatRooms(property.specifications.rooms),
    fullAddress,
    isNew: isNewProperty(property.metadata?.publishedAt),
    daysSincePublished,
    
    // SEO and URL
    url: `/objekt/${property.slug}`,
    metaDescription: property.content.shortDescription || 
      property.content.fullDescription.substring(0, 160),
    
    // Images (will be populated by component)
    imageCount: 0
  };
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Check if property has required images
 */
export function hasRequiredImages(imageCount: number, propertyType: PropertyType): boolean {
  // Minimum image requirements by property type
  const minimumImages: Record<PropertyType, number> = {
    villa: 5,
    lagenhet: 3,
    radhus: 4,
    tomt: 1,
    fritidshus: 3
  };

  return imageCount >= minimumImages[propertyType];
}

/**
 * Check if property is ready for publishing
 */
export function isReadyForPublishing(property: Property, imageCount: number): {
  isReady: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  // Check required fields
  if (!property.content.title) missingFields.push('Rubrik');
  if (!property.content.fullDescription) missingFields.push('Fullständig beskrivning');
  if (!property.address.street) missingFields.push('Gatuadress');
  if (!property.address.city) missingFields.push('Ort');
  if (!property.address.postalCode) missingFields.push('Postnummer');
  if (!property.specifications.livingArea) missingFields.push('Boarea');
  if (!property.specifications.rooms) missingFields.push('Antal rum');
  if (!property.specifications.buildYear) missingFields.push('Byggår');
  if (!property.pricing.askingPrice) missingFields.push('Utgångspris');
  
  // Check images
  if (!hasRequiredImages(imageCount, property.propertyType)) {
    missingFields.push('Tillräckligt antal bilder');
  }

  return {
    isReady: missingFields.length === 0,
    missingFields
  };
}

// ============================================================
// SEARCH AND FILTER HELPERS
// ============================================================

/**
 * Generate property search suggestions
 */
export function generateSearchSuggestions(query: string, properties: PropertyListItem[]): string[] {
  const suggestions = new Set<string>();
  const lowerQuery = query.toLowerCase();

  properties.forEach(property => {
    // Add city suggestions
    if (property.city.toLowerCase().includes(lowerQuery)) {
      suggestions.add(property.city);
    }
    
    // Add property type suggestions
    const typeLabel = formatPropertyType(property.propertyType);
    if (typeLabel.toLowerCase().includes(lowerQuery)) {
      suggestions.add(typeLabel);
    }
    
    // Add title suggestions (first 3 words)
    const titleWords = property.title.split(' ').slice(0, 3).join(' ');
    if (titleWords.toLowerCase().includes(lowerQuery)) {
      suggestions.add(titleWords);
    }
  });

  return Array.from(suggestions).slice(0, 10);
}

/**
 * Sort properties by field and direction
 */
export function sortProperties(
  properties: PropertyListItem[], 
  field: string, 
  direction: 'asc' | 'desc'
): PropertyListItem[] {
  return [...properties].sort((a, b) => {
    let aValue: any = a[field as keyof PropertyListItem];
    let bValue: any = b[field as keyof PropertyListItem];

    // Handle nested fields
    if (field.includes('.')) {
      const fields = field.split('.');
      aValue = fields.reduce((obj, key) => obj?.[key], a as any);
      bValue = fields.reduce((obj, key) => obj?.[key], b as any);
    }

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle strings
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (direction === 'asc') {
      return aStr.localeCompare(bStr, 'sv-SE');
    } else {
      return bStr.localeCompare(aStr, 'sv-SE');
    }
  });
}

// ============================================================
// URL AND SEO HELPERS
// ============================================================

/**
 * Generate SEO-friendly slug from property data
 */
export function generatePropertySlug(
  title: string, 
  fastighetsbeteckning: string,
  id?: string
): string {
  // Start with title
  let slug = title
    .toLowerCase()
    .replace(/[åäö]/g, (char) => {
      switch (char) {
        case 'å': return 'a';
        case 'ä': return 'a';
        case 'ö': return 'o';
        default: return char;
      }
    })
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .trim();

  // Add property designation for uniqueness
  const designation = fastighetsbeteckning
    .toLowerCase()
    .replace(/[åäö]/g, (char) => {
      switch (char) {
        case 'å': return 'a';
        case 'ä': return 'a';
        case 'ö': return 'o';
        default: return char;
      }
    })
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-');

  slug = `${slug}-${designation}`;

  // Add ID suffix if provided for additional uniqueness
  if (id) {
    const shortId = id.split('-')[0]; // Use first part of UUID
    slug = `${slug}-${shortId}`;
  }

  // Ensure reasonable length
  if (slug.length > 200) {
    slug = slug.substring(0, 200);
  }

  // Clean up ending
  slug = slug.replace(/-+$/, '');

  return slug;
}

/**
 * Generate meta description for property
 */
export function generateMetaDescription(property: Property): string {
  const { content, address, specifications, pricing } = property;
  
  const description = content.shortDescription || content.fullDescription;
  const price = formatSEK(pricing.askingPrice);
  const area = formatArea(specifications.livingArea);
  const rooms = formatRooms(specifications.rooms);
  const location = `${address.city}`;

  return `${description.substring(0, 100)} ${price}, ${area}, ${rooms} i ${location}. Se bilder och boka visning!`
    .substring(0, 160);
}

// ============================================================
// EXPORT ALL UTILITIES
// ============================================================

export const propertyUtils = {
  // Formatting
  formatSEK,
  formatArea,
  formatRooms,
  formatSwedishDate,
  formatRelativeTime,
  formatPropertyType,
  formatPropertyStatus,
  formatAddress,
  
  // Calculations
  calculatePricePerSqm,
  calculateDaysSincePublished,
  calculatePriceChange,
  isNewProperty,
  
  // Transformations
  transformToListItem,
  transformToCalculated,
  
  // Validation
  hasRequiredImages,
  isReadyForPublishing,
  
  // Search and Filter
  generateSearchSuggestions,
  sortProperties,
  
  // SEO and URLs
  generatePropertySlug,
  generateMetaDescription
};