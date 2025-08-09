/**
 * Swedish validation messages
 * Structured by domain and validation type
 */

export const messages = {
  // Core validation messages
  validation: {
    required: '{field} är obligatoriskt',
    invalid: '{field} är ogiltigt',
    invalid_type: '{field} har fel typ, förväntade {expected} men fick {received}',
    invalid_literal: '{field} måste vara exakt {expected}',
    custom: '{field} är ogiltigt',
    invalid_union: '{field} matchar ingen av de tillåtna typerna',
    invalid_union_discriminator: 'Ogiltig diskriminator för {field}',
    invalid_enum_value: '{field} måste vara en av: {options}. Fick: {received}',
    unrecognized_keys: 'Okända fält: {keys}',
    invalid_arguments: 'Ogiltiga argument',
    invalid_return_type: 'Ogiltig returtyp',
    invalid_date: '{field} är inte ett giltigt datum',
    invalid_string: '{field} är inte en giltig sträng',
    too_small: {
      string: '{field} måste vara minst {min} tecken',
      number: '{field} måste vara minst {min}',
      array: '{field} måste innehålla minst {min} element',
      date: '{field} måste vara efter {min}',
      object: '{field} måste ha minst {min} nycklar',
      set: '{field} måste ha minst {min} element',
    },
    too_big: {
      string: '{field} får vara max {max} tecken',
      number: '{field} får vara max {max}',
      array: '{field} får innehålla max {max} element',
      date: '{field} måste vara före {max}',
      object: '{field} får ha max {max} nycklar',
      set: '{field} får ha max {max} element',
    },
    not_multiple_of: '{field} måste vara en multipel av {multipleOf}',
    not_finite: '{field} måste vara ett ändligt tal',
  },

  // Swedish-specific validations
  swedish: {
    personnummer: {
      invalid: 'Ogiltigt personnummer',
      invalid_format: 'Personnummer måste vara i formatet ÅÅMMDD-XXXX eller ÅÅÅÅMMDD-XXXX',
      invalid_checksum: 'Felaktig kontrollsiffra i personnummer',
      invalid_date: 'Ogiltigt datum i personnummer',
      future_date: 'Personnummer kan inte vara från framtiden',
      too_old: 'Personnummer indikerar en ålder över 120 år',
      samordningsnummer: 'Samordningsnummer accepteras inte',
      testpersonnummer: 'Testpersonnummer accepteras inte i produktion',
    },
    organisationsnummer: {
      invalid: 'Ogiltigt organisationsnummer',
      invalid_format: 'Organisationsnummer måste vara i formatet XXXXXX-XXXX',
      invalid_checksum: 'Felaktig kontrollsiffra i organisationsnummer',
      invalid_type: 'Ogiltig organisationstyp',
    },
    postnummer: {
      invalid: 'Ogiltigt postnummer',
      invalid_format: 'Postnummer måste vara i formatet XXX XX',
      invalid_range: 'Postnummer finns inte i Sverige',
    },
    telefonnummer: {
      invalid: 'Ogiltigt telefonnummer',
      invalid_format: 'Telefonnummer måste börja med 0 eller +46',
      invalid_length: 'Telefonnummer måste vara 10 siffror (exklusive riktnummer)',
      invalid_mobile: 'Ogiltigt mobilnummer',
      invalid_landline: 'Ogiltigt fastnätsnummer',
    },
    fastighetsbeteckning: {
      invalid: 'Ogiltig fastighetsbeteckning',
      invalid_format: 'Fastighetsbeteckning måste följa formatet KOMMUN TRAKT BLOCK:ENHET',
      invalid_kommun: 'Ogiltig kommun i fastighetsbeteckning',
      invalid_block: 'Block måste vara ett nummer',
      invalid_enhet: 'Enhet måste vara ett nummer',
    },
  },

  // Domain-specific messages
  kontakt: {
    typ: {
      invalid: 'Ogiltig kontakttyp',
      required: 'Kontakttyp måste anges',
    },
    kategori: {
      invalid: 'Ogiltig kontaktkategori',
      required: 'Kategori måste anges för denna kontakttyp',
    },
    namn: {
      fornamn_required: 'Förnamn är obligatoriskt för privatpersoner',
      efternamn_required: 'Efternamn är obligatoriskt för privatpersoner',
      foretagsnamn_required: 'Företagsnamn är obligatoriskt för företag',
    },
    identitet: {
      personnummer_required: 'Personnummer krävs för privatpersoner',
      organisationsnummer_required: 'Organisationsnummer krävs för företag',
      myndig_required: 'Kontaktpersonen måste vara myndig (18 år eller äldre)',
    },
    gdpr: {
      consent_required: 'GDPR-samtycke krävs',
      consent_date_required: 'Datum för GDPR-samtycke måste anges',
    },
  },

  objekt: {
    typ: {
      invalid: 'Ogiltig objekttyp',
      required: 'Objekttyp måste anges',
    },
    status: {
      invalid: 'Ogiltig objektstatus',
      transition_invalid: 'Ogiltig statusövergång från {from} till {to}',
    },
    pris: {
      utgangspris_required: 'Utgångspris krävs för publicering',
      negative: 'Priset kan inte vara negativt',
      unrealistic_low: 'Priset verkar orimligt lågt',
      unrealistic_high: 'Priset verkar orimligt högt',
      slutpris_without_kopare: 'Slutpris kräver att köpare är angiven',
    },
    area: {
      boarea_required: 'Boarea måste anges',
      invalid_relation: 'Boarea kan inte vara mindre än biarea',
      unrealistic: 'Arean verkar orimlig för denna objekttyp',
    },
    energi: {
      klass_required: 'Energiklass krävs för byggnader byggda efter 2009',
      prestanda_mismatch: 'Energiprestanda stämmer inte överens med angiven energiklass',
    },
    koordinater: {
      invalid_latitude: 'Latitud måste vara mellan -90 och 90',
      invalid_longitude: 'Longitud måste vara mellan -180 och 180',
      outside_sweden: 'Koordinaterna ligger utanför Sveriges gränser',
    },
  },

  visning: {
    typ: {
      invalid: 'Ogiltig visningstyp',
      required: 'Visningstyp måste anges',
    },
    tid: {
      invalid_format: 'Tid måste anges i formatet HH:MM',
      end_before_start: 'Sluttid måste vara efter starttid',
      past_date: 'Visningsdatum kan inte vara i det förflutna',
      too_early: 'Visning kan inte börja före kl 07:00',
      too_late: 'Visning kan inte sluta efter kl 21:00',
      overlap: 'Visningstiden överlappar med en annan visning',
    },
    anmalan: {
      after_deadline: 'Anmälan efter sista anmälningsdatum',
      full: 'Visningen är fullbokad',
      duplicate: 'Du är redan anmäld till denna visning',
    },
  },

  bud: {
    belopp: {
      too_low: 'Budet måste vara minst {minimum} kr',
      increment_too_small: 'Budet måste höjas med minst {increment} kr',
      exceeds_limit: 'Budet överskrider din förhandsgodkända gräns',
    },
    status: {
      invalid_transition: 'Ogiltig statusändring för bud',
      already_accepted: 'Ett annat bud har redan accepterats',
      expired: 'Budet har gått ut',
    },
    villkor: {
      missing_loan_approval: 'Lånelöfte krävs för bud över {amount} kr',
      invalid_tilltraede: 'Tillträdesdatum kan inte vara före {earliest}',
    },
  },

  // Common field labels
  fields: {
    fornamn: 'Förnamn',
    efternamn: 'Efternamn',
    foretagsnamn: 'Företagsnamn',
    epost: 'E-postadress',
    telefon: 'Telefonnummer',
    personnummer: 'Personnummer',
    organisationsnummer: 'Organisationsnummer',
    adress: 'Adress',
    postnummer: 'Postnummer',
    ort: 'Ort',
    kommun: 'Kommun',
    lan: 'Län',
    typ: 'Typ',
    status: 'Status',
    pris: 'Pris',
    utgangspris: 'Utgångspris',
    slutpris: 'Slutpris',
    boarea: 'Boarea',
    biarea: 'Biarea',
    tomtarea: 'Tomtarea',
    rum: 'Antal rum',
    byggaar: 'Byggår',
    energiklass: 'Energiklass',
    datum: 'Datum',
    tid: 'Tid',
    starttid: 'Starttid',
    sluttid: 'Sluttid',
    belopp: 'Belopp',
    meddelande: 'Meddelande',
    beskrivning: 'Beskrivning',
  },

  // Error severity levels
  severity: {
    error: 'Fel',
    warning: 'Varning',
    info: 'Information',
  },

  // Common actions
  actions: {
    retry: 'Försök igen',
    cancel: 'Avbryt',
    save: 'Spara',
    delete: 'Ta bort',
    edit: 'Redigera',
    view: 'Visa',
    close: 'Stäng',
    confirm: 'Bekräfta',
  },
}