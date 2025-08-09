/**
 * Swedish-specific validators
 */

/**
 * Validates Swedish personal identity number (personnummer)
 * Format: YYYYMMDD-XXXX or YYMMDD-XXXX
 */
export function personnummerValidator(value: string): boolean {
  if (!value) return false
  
  // Remove any spaces or hyphens
  const cleaned = value.replace(/[\s-]/g, '')
  
  // Check length (10 or 12 digits)
  if (cleaned.length !== 10 && cleaned.length !== 12) {
    return false
  }
  
  // Extract the date part and control digits
  let datePart: string
  let controlDigits: string
  
  if (cleaned.length === 12) {
    // Full format: YYYYMMDDXXXX
    datePart = cleaned.substring(0, 8)
    controlDigits = cleaned.substring(8)
  } else {
    // Short format: YYMMDDXXXX
    datePart = cleaned.substring(0, 6)
    controlDigits = cleaned.substring(6)
  }
  
  // Validate the date
  if (!validatePersonnummerDate(datePart)) {
    return false
  }
  
  // Validate control digit using Luhn algorithm
  const fullNumber = cleaned.length === 12 ? cleaned.substring(2) : cleaned
  return luhnCheck(fullNumber)
}

/**
 * Validates Swedish organization number (organisationsnummer)
 * Format: XXXXXX-XXXX
 */
export function organisationsnummerValidator(value: string): boolean {
  if (!value) return false
  
  // Remove any spaces or hyphens
  const cleaned = value.replace(/[\s-]/g, '')
  
  // Check length (10 digits)
  if (cleaned.length !== 10) {
    return false
  }
  
  // First digit should be 2-9 for organizations
  const firstDigit = parseInt(cleaned[0])
  if (firstDigit < 2 || firstDigit > 9) {
    return false
  }
  
  // Validate using Luhn algorithm
  return luhnCheck(cleaned)
}

/**
 * Validates Swedish postal code
 * Format: XXX XX (3 digits, space, 2 digits)
 */
export function postnummerValidator(value: string): boolean {
  if (!value) return false
  
  // Remove spaces
  const cleaned = value.replace(/\s/g, '')
  
  // Check if it's 5 digits
  if (!/^\d{5}$/.test(cleaned)) {
    return false
  }
  
  // Swedish postal codes typically range from 10000 to 99999
  const numericValue = parseInt(cleaned)
  return numericValue >= 10000 && numericValue <= 99999
}

/**
 * Validates Swedish phone number
 * Accepts formats: +46XXXXXXXXX, 0XXXXXXXXX, 07XXXXXXXX, etc.
 */
export function telefonnummerValidator(value: string): boolean {
  if (!value) return false
  
  // Remove spaces, hyphens, and parentheses
  const cleaned = value.replace(/[\s\-()]/g, '')
  
  // Check if it starts with +46 (Sweden)
  if (cleaned.startsWith('+46')) {
    // Remove +46 and add leading 0
    const withoutCountryCode = '0' + cleaned.substring(3)
    return /^0\d{8,9}$/.test(withoutCountryCode)
  }
  
  // Check Swedish number format (starting with 0)
  return /^0\d{8,9}$/.test(cleaned)
}

/**
 * Validates date part of personnummer
 */
function validatePersonnummerDate(datePart: string): boolean {
  let year: number
  let month: number
  let day: number
  
  if (datePart.length === 8) {
    // YYYYMMDD
    year = parseInt(datePart.substring(0, 4))
    month = parseInt(datePart.substring(4, 6))
    day = parseInt(datePart.substring(6, 8))
  } else {
    // YYMMDD - assume 1900s or 2000s based on current year
    const shortYear = parseInt(datePart.substring(0, 2))
    const currentYear = new Date().getFullYear()
    const currentCentury = Math.floor(currentYear / 100) * 100
    
    // If YY is greater than current year's last two digits, assume previous century
    if (shortYear > (currentYear % 100)) {
      year = currentCentury - 100 + shortYear
    } else {
      year = currentCentury + shortYear
    }
    
    month = parseInt(datePart.substring(2, 4))
    day = parseInt(datePart.substring(4, 6))
  }
  
  // Validate month
  if (month < 1 || month > 12) {
    return false
  }
  
  // Validate day
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) {
    // Check for coordination number (day + 60)
    if (day >= 61 && day <= 60 + daysInMonth) {
      return true
    }
    return false
  }
  
  return true
}

/**
 * Luhn algorithm check
 */
function luhnCheck(value: string): boolean {
  let sum = 0
  let isEven = false
  
  // Loop through values from right to left
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit = digit - 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Format personnummer for display
 */
export function formatPersonnummer(value: string): string {
  if (!value) return ''
  
  const cleaned = value.replace(/[\s-]/g, '')
  
  if (cleaned.length === 12) {
    // YYYYMMDD-XXXX
    return `${cleaned.substring(0, 8)}-${cleaned.substring(8)}`
  } else if (cleaned.length === 10) {
    // YYMMDD-XXXX
    return `${cleaned.substring(0, 6)}-${cleaned.substring(6)}`
  }
  
  return value
}

/**
 * Format organisationsnummer for display
 */
export function formatOrganisationsnummer(value: string): string {
  if (!value) return ''
  
  const cleaned = value.replace(/[\s-]/g, '')
  
  if (cleaned.length === 10) {
    // XXXXXX-XXXX
    return `${cleaned.substring(0, 6)}-${cleaned.substring(6)}`
  }
  
  return value
}

/**
 * Format postnummer for display
 */
export function formatPostnummer(value: string): string {
  if (!value) return ''
  
  const cleaned = value.replace(/\s/g, '')
  
  if (cleaned.length === 5) {
    // XXX XX
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`
  }
  
  return value
}

/**
 * Format telefonnummer for display
 */
export function formatTelefonnummer(value: string): string {
  if (!value) return ''
  
  const cleaned = value.replace(/[\s\-()]/g, '')
  
  if (cleaned.startsWith('+46')) {
    // +46 XX XXX XX XX
    const withoutCountryCode = cleaned.substring(3)
    if (withoutCountryCode.length >= 8) {
      return `+46 ${withoutCountryCode.substring(0, 2)} ${withoutCountryCode.substring(2, 5)} ${withoutCountryCode.substring(5, 7)} ${withoutCountryCode.substring(7)}`
    }
  } else if (cleaned.startsWith('0')) {
    // 0XX-XXX XX XX
    if (cleaned.length >= 9) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`
    }
  }
  
  return value
}

/**
 * Validates Swedish property designation (fastighetsbeteckning)
 * Format: KOMMUN TRAKT:BLOCK:ENHET (e.g., "Stockholm Södermalm 1:2")
 */
export function fastighetsbeteckningValidator(value: string): boolean {
  if (!value) return false
  
  // Trim whitespace
  const trimmed = value.trim()
  
  // Basic pattern: Letters/spaces followed by letters/numbers followed by colon and numbers
  const basicPattern = /^[a-zA-ZåäöÅÄÖ\s]+ [a-zA-ZåäöÅÄÖ0-9\s]+ \d+:\d+(?::\d+)?$/
  
  if (!basicPattern.test(trimmed)) {
    return false
  }
  
  // Split into parts
  const parts = trimmed.split(' ')
  if (parts.length < 3) {
    return false
  }
  
  // Last part should contain the numeric designation
  const lastPart = parts[parts.length - 1]
  const colonParts = lastPart.split(':')
  
  // Must have at least block:unit (2 parts), optionally block:unit:subunit (3 parts)
  if (colonParts.length < 2 || colonParts.length > 3) {
    return false
  }
  
  // All parts after colon must be numeric and positive
  for (const part of colonParts) {
    const num = parseInt(part, 10)
    if (isNaN(num) || num <= 0) {
      return false
    }
  }
  
  return true
}

/**
 * Format fastighetsbeteckning for display
 */
export function formatFastighetsbeteckning(value: string): string {
  if (!value) return ''
  
  // Basic cleanup - remove extra spaces
  return value.trim().replace(/\s+/g, ' ')
}