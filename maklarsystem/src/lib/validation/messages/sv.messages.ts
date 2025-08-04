/**
 * Swedish validation error messages
 */

export const validationMessages = {
  // Common messages
  required: 'Detta fält är obligatoriskt',
  invalid: 'Ogiltigt värde',
  tooShort: 'För kort',
  tooLong: 'För långt',
  
  // Type messages
  string: {
    email: 'Ogiltig e-postadress',
    url: 'Ogiltig URL',
    min: 'Måste vara minst {{min}} tecken',
    max: 'Får vara max {{max}} tecken'
  },
  
  number: {
    min: 'Måste vara minst {{min}}',
    max: 'Får vara max {{max}}',
    positive: 'Måste vara ett positivt tal',
    integer: 'Måste vara ett heltal'
  },
  
  // Swedish specific
  swedish: {
    personnummer: 'Ogiltigt personnummer',
    organisationsnummer: 'Ogiltigt organisationsnummer',
    postnummer: 'Ogiltigt postnummer (XXX XX)',
    telefonnummer: 'Ogiltigt telefonnummer',
    fastighetsbeteckning: 'Ogiltig fastighetsbeteckning'
  },
  
  // Property specific
  property: {
    typ: 'Ogiltig fastighetstyp',
    status: 'Ogiltig status',
    energiklass: 'Ogiltig energiklass',
    areaRelation: 'Boarea måste vara större än biarea',
    priceRelation: 'Prisrelationerna verkar orimliga',
    coordinates: 'Koordinaterna ligger utanför Sverige',
    energyMismatch: 'Energiprestanda stämmer inte med energiklassen'
  },
  
  // Financial
  financial: {
    price: 'Ogiltigt pris',
    priceRange: 'Priset verkar orimligt',
    monthlyFee: 'Månadsavgiften verkar orimlig',
    bidIncrement: 'Budet måste vara minst {{increment}} kr högre'
  },
  
  // Contact
  contact: {
    typ: 'Ogiltig kontakttyp',
    kategori: 'Ogiltig kategori',
    nameRequired: 'Namn är obligatoriskt',
    companyRequired: 'Företagsnamn är obligatoriskt'
  },
  
  // Viewing
  viewing: {
    typ: 'Ogiltig visningstyp',
    timeFormat: 'Ogiltig tid (HH:MM)',
    endBeforeStart: 'Sluttid måste vara efter starttid',
    dateInPast: 'Datum kan inte vara i det förflutna'
  },
  
  // Bid
  bid: {
    status: 'Ogiltig budstatus',
    amount: 'Ogiltigt budbelopp',
    tooLow: 'Budet är för lågt'
  }
}

/**
 * Format validation message with parameters
 */
export function formatValidationMessage(
  template: string,
  params: Record<string, any>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

/**
 * Get nested message by path
 */
export function getValidationMessage(path: string): string {
  const keys = path.split('.')
  let current: any = validationMessages
  
  for (const key of keys) {
    if (current[key]) {
      current = current[key]
    } else {
      return validationMessages.invalid
    }
  }
  
  return typeof current === 'string' ? current : validationMessages.invalid
}