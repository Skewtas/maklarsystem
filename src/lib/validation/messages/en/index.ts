/**
 * English validation messages (fallback)
 * Structured by domain and validation type
 */

export const messages = {
  // Core validation messages
  validation: {
    required: '{field} is required',
    invalid: '{field} is invalid',
    invalid_type: '{field} has wrong type, expected {expected} but got {received}',
    invalid_literal: '{field} must be exactly {expected}',
    custom: '{field} is invalid',
    invalid_union: '{field} does not match any of the allowed types',
    invalid_union_discriminator: 'Invalid discriminator for {field}',
    invalid_enum_value: '{field} must be one of: {options}. Got: {received}',
    unrecognized_keys: 'Unrecognized keys: {keys}',
    invalid_arguments: 'Invalid arguments',
    invalid_return_type: 'Invalid return type',
    invalid_date: '{field} is not a valid date',
    invalid_string: '{field} is not a valid string',
    too_small: {
      string: '{field} must be at least {min} characters',
      number: '{field} must be at least {min}',
      array: '{field} must contain at least {min} items',
      date: '{field} must be after {min}',
      object: '{field} must have at least {min} keys',
      set: '{field} must have at least {min} items',
    },
    too_big: {
      string: '{field} must be at most {max} characters',
      number: '{field} must be at most {max}',
      array: '{field} must contain at most {max} items',
      date: '{field} must be before {max}',
      object: '{field} must have at most {max} keys',
      set: '{field} must have at most {max} items',
    },
    not_multiple_of: '{field} must be a multiple of {multipleOf}',
    not_finite: '{field} must be a finite number',
  },

  // Swedish-specific validations (kept in Swedish context)
  swedish: {
    personnummer: {
      invalid: 'Invalid Swedish personal number',
      invalid_format: 'Personal number must be in format YYMMDD-XXXX or YYYYMMDD-XXXX',
      invalid_checksum: 'Invalid checksum in personal number',
      invalid_date: 'Invalid date in personal number',
      future_date: 'Personal number cannot be from the future',
      too_old: 'Personal number indicates age over 120 years',
      samordningsnummer: 'Coordination numbers are not accepted',
      testpersonnummer: 'Test personal numbers are not accepted in production',
    },
    organisationsnummer: {
      invalid: 'Invalid Swedish organization number',
      invalid_format: 'Organization number must be in format XXXXXX-XXXX',
      invalid_checksum: 'Invalid checksum in organization number',
      invalid_type: 'Invalid organization type',
    },
    postnummer: {
      invalid: 'Invalid postal code',
      invalid_format: 'Postal code must be in format XXX XX',
      invalid_range: 'Postal code does not exist in Sweden',
    },
    telefonnummer: {
      invalid: 'Invalid phone number',
      invalid_format: 'Phone number must start with 0 or +46',
      invalid_length: 'Phone number must be 10 digits (excluding area code)',
      invalid_mobile: 'Invalid mobile number',
      invalid_landline: 'Invalid landline number',
    },
    fastighetsbeteckning: {
      invalid: 'Invalid property designation',
      invalid_format: 'Property designation must follow format MUNICIPALITY TRACT BLOCK:UNIT',
      invalid_kommun: 'Invalid municipality in property designation',
      invalid_block: 'Block must be a number',
      invalid_enhet: 'Unit must be a number',
    },
  },

  // Domain-specific messages
  kontakt: {
    typ: {
      invalid: 'Invalid contact type',
      required: 'Contact type must be specified',
    },
    kategori: {
      invalid: 'Invalid contact category',
      required: 'Category must be specified for this contact type',
    },
    namn: {
      fornamn_required: 'First name is required for individuals',
      efternamn_required: 'Last name is required for individuals',
      foretagsnamn_required: 'Company name is required for companies',
    },
    identitet: {
      personnummer_required: 'Personal number is required for individuals',
      organisationsnummer_required: 'Organization number is required for companies',
      myndig_required: 'Contact person must be of legal age (18 years or older)',
    },
    gdpr: {
      consent_required: 'GDPR consent is required',
      consent_date_required: 'GDPR consent date must be specified',
    },
  },

  objekt: {
    typ: {
      invalid: 'Invalid property type',
      required: 'Property type must be specified',
    },
    status: {
      invalid: 'Invalid property status',
      transition_invalid: 'Invalid status transition from {from} to {to}',
    },
    pris: {
      utgangspris_required: 'Starting price is required for publication',
      negative: 'Price cannot be negative',
      unrealistic_low: 'Price seems unrealistically low',
      unrealistic_high: 'Price seems unrealistically high',
      slutpris_without_kopare: 'Final price requires buyer to be specified',
    },
    area: {
      boarea_required: 'Living area must be specified',
      invalid_relation: 'Living area cannot be less than additional area',
      unrealistic: 'Area seems unrealistic for this property type',
    },
    energi: {
      klass_required: 'Energy class is required for buildings built after 2009',
      prestanda_mismatch: 'Energy performance does not match specified energy class',
    },
    koordinater: {
      invalid_latitude: 'Latitude must be between -90 and 90',
      invalid_longitude: 'Longitude must be between -180 and 180',
      outside_sweden: 'Coordinates are outside Swedish borders',
    },
  },

  visning: {
    typ: {
      invalid: 'Invalid showing type',
      required: 'Showing type must be specified',
    },
    tid: {
      invalid_format: 'Time must be in format HH:MM',
      end_before_start: 'End time must be after start time',
      past_date: 'Showing date cannot be in the past',
      too_early: 'Showing cannot start before 07:00',
      too_late: 'Showing cannot end after 21:00',
      overlap: 'Showing time overlaps with another showing',
    },
    anmalan: {
      after_deadline: 'Registration after deadline',
      full: 'Showing is fully booked',
      duplicate: 'You are already registered for this showing',
    },
  },

  bud: {
    belopp: {
      too_low: 'Bid must be at least {minimum} kr',
      increment_too_small: 'Bid must be increased by at least {increment} kr',
      exceeds_limit: 'Bid exceeds your pre-approved limit',
    },
    status: {
      invalid_transition: 'Invalid status change for bid',
      already_accepted: 'Another bid has already been accepted',
      expired: 'Bid has expired',
    },
    villkor: {
      missing_loan_approval: 'Loan approval required for bids over {amount} kr',
      invalid_tilltraede: 'Closing date cannot be before {earliest}',
    },
  },

  // Common field labels
  fields: {
    fornamn: 'First name',
    efternamn: 'Last name',
    foretagsnamn: 'Company name',
    epost: 'Email address',
    telefon: 'Phone number',
    personnummer: 'Personal number',
    organisationsnummer: 'Organization number',
    adress: 'Address',
    postnummer: 'Postal code',
    ort: 'City',
    kommun: 'Municipality',
    lan: 'County',
    typ: 'Type',
    status: 'Status',
    pris: 'Price',
    utgangspris: 'Starting price',
    slutpris: 'Final price',
    boarea: 'Living area',
    biarea: 'Additional area',
    tomtarea: 'Plot area',
    rum: 'Number of rooms',
    byggaar: 'Year built',
    energiklass: 'Energy class',
    datum: 'Date',
    tid: 'Time',
    starttid: 'Start time',
    sluttid: 'End time',
    belopp: 'Amount',
    meddelande: 'Message',
    beskrivning: 'Description',
  },

  // Error severity levels
  severity: {
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  },

  // Common actions
  actions: {
    retry: 'Try again',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    confirm: 'Confirm',
  },
}