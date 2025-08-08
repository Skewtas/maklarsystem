// Example: Swedish-Specific Validation Utilities
// Comprehensive validation for Swedish formats

import { z } from 'zod';

/**
 * Validates Swedish personal identity numbers (personnummer)
 * Format: YYYYMMDD-XXXX or YYMMDD-XXXX
 */
export function validatePersonnummer(personnummer: string): boolean {
  const cleaned = personnummer.replace(/\D/g, '');
  
  if (cleaned.length !== 10 && cleaned.length !== 12) {
    return false;
  }
  
  const numbers = cleaned.length === 10 ? cleaned : cleaned.slice(2);
  
  // Luhn algorithm for checksum validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(numbers[i]);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    sum += num;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(numbers[9]);
}

/**
 * Validates Swedish organization numbers (organisationsnummer)
 * Format: XXXXXX-XXXX
 */
export function validateOrganisationsnummer(orgnr: string): boolean {
  const cleaned = orgnr.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return false;
  }
  
  // First digit indicates organization type
  const firstDigit = parseInt(cleaned[0]);
  if (firstDigit < 1 || firstDigit > 9) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(cleaned[i]);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    sum += num;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleaned[9]);
}

/**
 * Validates Swedish property designation (fastighetsbeteckning)
 * Format: Municipality Block:Unit (e.g., "Kungsholmen 1:23")
 */
export function validateFastighetsbeteckning(beteckning: string): boolean {
  // Pattern: Municipality name (with Swedish chars) + space + numbers:numbers
  const pattern = /^[A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\s-]+\s+\d+:\d+$/;
  return pattern.test(beteckning);
}

/**
 * Validates Swedish postal codes
 * Format: XXX XX (3 digits, space, 2 digits)
 */
export function validatePostnummer(postnummer: string): boolean {
  const cleaned = postnummer.replace(/\s/g, '');
  
  if (cleaned.length !== 5) {
    return false;
  }
  
  return /^\d{5}$/.test(cleaned);
}

/**
 * Validates Swedish phone numbers
 * Accepts: +46, 07X, 08, etc.
 */
export function validateTelefonnummer(telefon: string): boolean {
  const cleaned = telefon.replace(/[\s\-\(\)]/g, '');
  
  // International format
  if (cleaned.startsWith('+46')) {
    return /^\+46\d{9}$/.test(cleaned);
  }
  
  // Domestic format
  if (cleaned.startsWith('0')) {
    return /^0\d{8,9}$/.test(cleaned);
  }
  
  return false;
}

// Zod schemas with Swedish validation
export const svenskaSchemas = {
  personnummer: z.string().refine(validatePersonnummer, {
    message: 'Ogiltigt personnummer',
  }),
  
  organisationsnummer: z.string().refine(validateOrganisationsnummer, {
    message: 'Ogiltigt organisationsnummer',
  }),
  
  fastighetsbeteckning: z.string().refine(validateFastighetsbeteckning, {
    message: 'Ogiltig fastighetsbeteckning',
  }),
  
  postnummer: z.string().transform(val => val.replace(/\s/g, '')).refine(validatePostnummer, {
    message: 'Ogiltigt postnummer',
  }),
  
  telefonnummer: z.string().refine(validateTelefonnummer, {
    message: 'Ogiltigt telefonnummer',
  }),
  
  // Swedish currency with proper formatting
  kronor: z.number().or(
    z.string().transform(val => {
      // Remove spaces and "kr" suffix
      const cleaned = val.replace(/[\s]/g, '').replace(/kr$/i, '');
      return parseInt(cleaned);
    })
  ),
  
  // Swedish address schema
  adress: z.object({
    gatuadress: z.string().min(1, 'Gatuadress krävs'),
    postnummer: z.string().refine(validatePostnummer, 'Ogiltigt postnummer'),
    ort: z.string().min(1, 'Ort krävs'),
    lan: z.string().optional(),
  }),
};

// Format helpers for display
export const formatters = {
  personnummer: (pnr: string): string => {
    const cleaned = pnr.replace(/\D/g, '');
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 8)}-${cleaned.slice(8)}`;
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
    }
    return pnr;
  },
  
  postnummer: (postnr: string): string => {
    const cleaned = postnr.replace(/\s/g, '');
    if (cleaned.length === 5) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }
    return postnr;
  },
  
  telefonnummer: (tel: string): string => {
    const cleaned = tel.replace(/\D/g, '');
    if (cleaned.startsWith('46')) {
      // +46 70 123 45 67
      return `+46 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.startsWith('0')) {
      // 070-123 45 67
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    return tel;
  },
  
  kronor: (amount: number): string => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  kvadratmeter: (area: number): string => {
    return `${area.toLocaleString('sv-SE')} m²`;
  },
};