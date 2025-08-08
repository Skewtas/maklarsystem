/**
 * Property Schema Validation Tests
 * 
 * Comprehensive tests for property validation schemas including
 * Swedish-specific validation rules and business logic.
 */

import { describe, it, expect } from '@jest/globals';
import {
  propertySchema,
  createPropertySchema,
  updatePropertySchema,
  propertySearchSchema,
  addressSchema,
  specificationsSchema,
  pricingSchema,
  contentSchema
} from '../property.schema';

describe.skip('Property Schema Validation', () => {
  // ============================================================
  // VALID TEST DATA
  // ============================================================

  const validProperty = {
    fastighetsbeteckning: 'Stockholm 1:23',
    propertyType: 'lagenhet',
    status: 'till_salu',
    address: {
      street: 'Strandvägen 7A',
      city: 'Stockholm',
      postalCode: '11456',
      municipality: 'Stockholm',
      county: 'Stockholm',
      coordinates: {
        lat: 59.3293,
        lng: 18.0686
      }
    },
    specifications: {
      livingArea: 85,
      totalArea: 95,
      plotArea: null,
      rooms: 3.0,
      bedrooms: 2,
      bathrooms: 1,
      buildYear: 1925,
      floor: 4,
      floors: 6,
      hasElevator: true,
      hasBalcony: true,
      hasGarden: false,
      hasParking: false,
      energyClass: 'C',
      heatingType: 'fjärrvärme'
    },
    pricing: {
      askingPrice: 8500000,
      acceptedPrice: null,
      monthlyFee: 4200,
      operatingCost: 1500,
      propertyTax: 12000
    },
    content: {
      title: 'Elegant 3:a med havsutsikt på Strandvägen',
      shortDescription: 'Exklusiv lägenhet med fantastisk utsikt över vattnet',
      fullDescription: 'Välkommen till denna exklusiva 3-rumslägenhet på den prestigefulla Strandvägen. Lägenheten erbjuder en fantastisk utsikt över vattnet och har genomgått en smakfull renovering med höga kvalitetsval.',
      features: ['balkong', 'hiss', 'renoverad', 'havsutsikt']
    }
  };

  // ============================================================
  // ADDRESS SCHEMA TESTS
  // ============================================================

  describe('addressSchema', () => {
    it('should validate a complete valid address', () => {
      const result = addressSchema.safeParse(validProperty.address);
      expect(result.success).toBe(true);
    });

    it('should require street and city', () => {
      const invalidAddress = { postalCode: '11456' };
      const result = addressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // street and city missing
      }
    });

    it('should validate Swedish postal codes', () => {
      const validPostalCodes = ['11456', '123 45', '41650'];
      const invalidPostalCodes = ['1234', '123456', 'ABC12', '12 345'];

      validPostalCodes.forEach(postalCode => {
        const address = { ...validProperty.address, postalCode };
        const result = addressSchema.safeParse(address);
        expect(result.success).toBe(true);
      });

      invalidPostalCodes.forEach(postalCode => {
        const address = { ...validProperty.address, postalCode };
        const result = addressSchema.safeParse(address);
        expect(result.success).toBe(false);
      });
    });

    it('should validate coordinates', () => {
      const validCoordinates = [
        { lat: 59.3293, lng: 18.0686 }, // Stockholm
        { lat: 57.7089, lng: 11.9746 }, // Göteborg
        { lat: 55.6050, lng: 13.0038 }  // Malmö
      ];

      const invalidCoordinates = [
        { lat: 91, lng: 18.0686 }, // Invalid latitude
        { lat: 59.3293, lng: 181 }, // Invalid longitude
        { lat: -91, lng: 18.0686 }, // Invalid latitude
        { lat: 'invalid', lng: 18.0686 } // Non-numeric
      ];

      validCoordinates.forEach(coordinates => {
        const address = { ...validProperty.address, coordinates };
        const result = addressSchema.safeParse(address);
        expect(result.success).toBe(true);
      });

      invalidCoordinates.forEach(coordinates => {
        const address = { ...validProperty.address, coordinates };
        const result = addressSchema.safeParse(address);
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================
  // SPECIFICATIONS SCHEMA TESTS
  // ============================================================

  describe('specificationsSchema', () => {
    it('should validate complete specifications', () => {
      const result = specificationsSchema.safeParse(validProperty.specifications);
      expect(result.success).toBe(true);
    });

    it('should require positive living area', () => {
      const invalidSpecs = { ...validProperty.specifications, livingArea: 0 };
      const result = specificationsSchema.safeParse(invalidSpecs);
      expect(result.success).toBe(false);
    });

    it('should validate room count format', () => {
      const validRooms = [1, 1.5, 2, 2.5, 3, 4.5, 5];
      const invalidRooms = [0, 0.3, 6.7, -1, 'two'];

      validRooms.forEach(rooms => {
        const specs = { ...validProperty.specifications, rooms };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(true);
      });

      invalidRooms.forEach(rooms => {
        const specs = { ...validProperty.specifications, rooms };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(false);
      });
    });

    it('should validate build year range', () => {
      const currentYear = new Date().getFullYear();
      const validYears = [1800, 1925, 2000, currentYear, currentYear + 1];
      const invalidYears = [1799, currentYear + 3, -1000, 0];

      validYears.forEach(buildYear => {
        const specs = { ...validProperty.specifications, buildYear };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(true);
      });

      invalidYears.forEach(buildYear => {
        const specs = { ...validProperty.specifications, buildYear };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(false);
      });
    });

    it('should validate area relationships', () => {
      // Total area should be >= living area
      const validSpecs1 = { 
        ...validProperty.specifications, 
        livingArea: 80, 
        totalArea: 85 
      };
      const invalidSpecs1 = { 
        ...validProperty.specifications, 
        livingArea: 100, 
        totalArea: 80 
      };

      expect(specificationsSchema.safeParse(validSpecs1).success).toBe(true);
      expect(specificationsSchema.safeParse(invalidSpecs1).success).toBe(false);
    });

    it('should validate energy classes', () => {
      const validClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const invalidClasses = ['H', 'AA', '1', 'a'];

      validClasses.forEach(energyClass => {
        const specs = { ...validProperty.specifications, energyClass };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(true);
      });

      invalidClasses.forEach(energyClass => {
        const specs = { ...validProperty.specifications, energyClass };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(false);
      });
    });

    it('should validate Swedish heating types', () => {
      const validTypes = ['fjärrvärme', 'el', 'gas', 'olja', 'pellets', 'bergvärme', 'annat'];
      const invalidTypes = ['coal', 'wood', 'invalid'];

      validTypes.forEach(heatingType => {
        const specs = { ...validProperty.specifications, heatingType };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(true);
      });

      invalidTypes.forEach(heatingType => {
        const specs = { ...validProperty.specifications, heatingType };
        const result = specificationsSchema.safeParse(specs);
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================
  // PRICING SCHEMA TESTS
  // ============================================================

  describe('pricingSchema', () => {
    it('should validate complete pricing information', () => {
      const result = pricingSchema.safeParse(validProperty.pricing);
      expect(result.success).toBe(true);
    });

    it('should require non-negative asking price', () => {
      const invalidPricing = { ...validProperty.pricing, askingPrice: -100 };
      const result = pricingSchema.safeParse(invalidPricing);
      expect(result.success).toBe(false);
    });

    it('should validate price reasonableness for Sweden', () => {
      const validPrices = [500000, 2000000, 5000000, 15000000, 50000000];
      const invalidPrices = [100, 100000000, 1000000000]; // Too low/high for Swedish market

      validPrices.forEach(askingPrice => {
        const pricing = { ...validProperty.pricing, askingPrice };
        const result = pricingSchema.safeParse(pricing);
        expect(result.success).toBe(true);
      });

      invalidPrices.forEach(askingPrice => {
        const pricing = { ...validProperty.pricing, askingPrice };
        const result = pricingSchema.safeParse(pricing);
        expect(result.success).toBe(false);
      });
    });

    it('should validate monthly fee reasonableness', () => {
      const validFees = [0, 1000, 5000, 15000]; // SEK per month
      const invalidFees = [-100, 50000, 100000]; // Negative or unreasonably high

      validFees.forEach(monthlyFee => {
        const pricing = { ...validProperty.pricing, monthlyFee };
        const result = pricingSchema.safeParse(pricing);
        expect(result.success).toBe(true);
      });

      invalidFees.forEach(monthlyFee => {
        const pricing = { ...validProperty.pricing, monthlyFee };
        const result = pricingSchema.safeParse(pricing);
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================
  // CONTENT SCHEMA TESTS
  // ============================================================

  describe('contentSchema', () => {
    it('should validate complete content', () => {
      const result = contentSchema.safeParse(validProperty.content);
      expect(result.success).toBe(true);
    });

    it('should require title and full description', () => {
      const invalidContent = { features: [] };
      const result = contentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // title and fullDescription missing
      }
    });

    it('should validate title length', () => {
      const validTitles = [
        'Villa',
        'Elegant 3:a med havsutsikt',
        'A'.repeat(255) // Maximum length
      ];
      const invalidTitles = [
        '', // Empty
        'A'.repeat(256) // Too long
      ];

      validTitles.forEach(title => {
        const content = { ...validProperty.content, title };
        const result = contentSchema.safeParse(content);
        expect(result.success).toBe(true);
      });

      invalidTitles.forEach(title => {
        const content = { ...validProperty.content, title };
        const result = contentSchema.safeParse(content);
        expect(result.success).toBe(false);
      });
    });

    it('should validate description length', () => {
      const validDescription = 'A'.repeat(50); // Minimum length
      const tooShortDescription = 'Short'; // Too short
      const tooLongDescription = 'A'.repeat(10001); // Too long

      expect(contentSchema.safeParse({
        ...validProperty.content,
        fullDescription: validDescription
      }).success).toBe(true);

      expect(contentSchema.safeParse({
        ...validProperty.content,
        fullDescription: tooShortDescription
      }).success).toBe(false);

      expect(contentSchema.safeParse({
        ...validProperty.content,
        fullDescription: tooLongDescription
      }).success).toBe(false);
    });

    it('should validate features array', () => {
      const validFeatures = [
        [],
        ['balkong'],
        ['balkong', 'hiss', 'renoverad'],
        Array(20).fill('feature') // Maximum 20 features
      ];

      const invalidFeatures = [
        [''],
        ['A'.repeat(101)], // Too long feature
        Array(21).fill('feature') // Too many features
      ];

      validFeatures.forEach(features => {
        const content = { ...validProperty.content, features };
        const result = contentSchema.safeParse(content);
        expect(result.success).toBe(true);
      });

      invalidFeatures.forEach(features => {
        const content = { ...validProperty.content, features };
        const result = contentSchema.safeParse(content);
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================
  // PROPERTY SCHEMA TESTS
  // ============================================================

  describe('propertySchema', () => {
    it('should validate a complete valid property', () => {
      const result = propertySchema.safeParse(validProperty);
      expect(result.success).toBe(true);
    });

    it('should validate fastighetsbeteckning format', () => {
      const validBeteckningar = [
        'Stockholm 1:23',
        'Göteborg 45:123',
        'Malmö 2:1',
        'UPPLANDS VÄSBY 1:456'
      ];

      const invalidBeteckningar = [
        'stockholm 1:23', // Lowercase
        'Stockholm1:23', // No space
        'Stockholm 1-23', // Wrong separator
        'Stockholm 123', // Missing colon and number
        '1:23', // Missing municipality
        'Stockholm :23' // Space before colon
      ];

      validBeteckningar.forEach(fastighetsbeteckning => {
        const property = { ...validProperty, fastighetsbeteckning };
        const result = propertySchema.safeParse(property);
        expect(result.success).toBe(true);
      });

      invalidBeteckningar.forEach(fastighetsbeteckning => {
        const property = { ...validProperty, fastighetsbeteckning };
        const result = propertySchema.safeParse(property);
        expect(result.success).toBe(false);
      });
    });

    it('should validate property types', () => {
      const validTypes = ['villa', 'lagenhet', 'radhus', 'tomt', 'fritidshus'];
      const invalidTypes = ['house', 'apartment', 'townhouse', 'land'];

      validTypes.forEach(propertyType => {
        const property = { ...validProperty, propertyType };
        const result = propertySchema.safeParse(property);
        expect(result.success).toBe(true);
      });

      invalidTypes.forEach(propertyType => {
        const property = { ...validProperty, propertyType };
        const result = propertySchema.safeParse(property);
        expect(result.success).toBe(false);
      });
    });

    it('should validate property statuses', () => {
      const validStatuses = ['kommande', 'till_salu', 'under_kontrakt', 'sald'];
      const invalidStatuses = ['for_sale', 'sold', 'pending'];

      validStatuses.forEach(status => {
        const property = { ...validProperty, status };
        const result = propertySchema.safeParse(property);
        expect(result.success).toBe(true);
      });

      invalidStatuses.forEach(status => {
        const property = { ...validProperty, status };
        const result = propertySchema.safeParse(property);
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================
  // SEARCH SCHEMA TESTS
  // ============================================================

  describe('propertySearchSchema', () => {
    it('should validate search parameters', () => {
      const searchParams = {
        query: 'Stockholm',
        propertyTypes: ['villa', 'lagenhet'],
        statuses: ['till_salu'],
        priceMin: 1000000,
        priceMax: 5000000,
        areaMin: 50,
        areaMax: 150,
        roomsMin: 2,
        roomsMax: 4,
        buildYearMin: 1950,
        buildYearMax: 2020,
        city: 'Stockholm',
        municipality: 'Stockholm'
      };

      const result = propertySearchSchema.safeParse(searchParams);
      expect(result.success).toBe(true);
    });

    it('should validate range parameters', () => {
      // Price range validation
      expect(propertySearchSchema.safeParse({
        priceMin: 2000000,
        priceMax: 1000000 // Max less than min
      }).success).toBe(false);

      // Area range validation
      expect(propertySearchSchema.safeParse({
        areaMin: 100,
        areaMax: 50 // Max less than min
      }).success).toBe(false);

      // Valid ranges
      expect(propertySearchSchema.safeParse({
        priceMin: 1000000,
        priceMax: 2000000
      }).success).toBe(true);
    });

    it('should validate optional parameters', () => {
      // Empty search should be valid
      expect(propertySearchSchema.safeParse({}).success).toBe(true);

      // Single parameter should be valid
      expect(propertySearchSchema.safeParse({
        query: 'Stockholm'
      }).success).toBe(true);
    });
  });

  // ============================================================
  // CREATE/UPDATE SCHEMA TESTS
  // ============================================================

  describe('createPropertySchema vs updatePropertySchema', () => {
    it('should require all fields for creation', () => {
      const incompleteProperty = {
        fastighetsbeteckning: 'Stockholm 1:23',
        propertyType: 'lagenhet'
        // Missing required fields
      };

      expect(createPropertySchema.safeParse(incompleteProperty).success).toBe(false);
      expect(updatePropertySchema.safeParse(incompleteProperty).success).toBe(true); // Partial updates allowed
    });

    it('should allow partial updates', () => {
      const partialUpdate = {
        pricing: {
          askingPrice: 9000000
        }
      };

      expect(updatePropertySchema.safeParse(partialUpdate).success).toBe(true);
      expect(createPropertySchema.safeParse(partialUpdate).success).toBe(false);
    });
  });
});