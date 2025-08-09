/**
 * Enhetstester för svenska personnummer-validering
 * Testar personnummerValidator och formatPersonnummer funktioner
 */

import { personnummerValidator, formatPersonnummer } from '../swedish.validators'

// Hjälpfunktion för att beräkna Luhn-kontrollsiffra
function calculateLuhnCheckDigit(baseNumber: string): string {
  let sum = 0
  let isEven = false
  
  // Loop through values from right to left (men inte den sista siffran)
  for (let i = baseNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(baseNumber.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit = digit - 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit.toString()
}

describe('Personnummer Validering', () => {
  describe('Giltiga personnummer', () => {
    test('ska acceptera giltigt 12-siffrigt personnummer', () => {
      // Använder kända giltiga personnummer
      expect(personnummerValidator('198112189876')).toBe(true) // Känt testpersonnummer
      expect(personnummerValidator('197001010003')).toBe(true) // Genererat giltigt nummer
      expect(personnummerValidator('198112180008')).toBe(true) // Genererat giltigt nummer
    })

    test('ska acceptera giltigt 10-siffrigt personnummer', () => {
      // Giltiga kortformat personnummer
      expect(personnummerValidator('8112189876')).toBe(true) 
      expect(personnummerValidator('7001010003')).toBe(true)
      expect(personnummerValidator('8112180008')).toBe(true)
    })

    test('ska acceptera personnummer med bindestreck', () => {
      expect(personnummerValidator('19811218-9876')).toBe(true)
      expect(personnummerValidator('811218-9876')).toBe(true)
      expect(personnummerValidator('19700101-0003')).toBe(true)
      expect(personnummerValidator('700101-0003')).toBe(true)
    })

    test('ska acceptera personnummer med mellanslag', () => {
      expect(personnummerValidator('198112189876')).toBe(true)
      expect(personnummerValidator('19811218 9876')).toBe(true)
      expect(personnummerValidator('811218 9876')).toBe(true)
    })

    test('ska acceptera samordningsnummer (dag + 60)', () => {
      // Samordningsnummer har dag + 60 (61-91)
      expect(personnummerValidator('19700162-0009')).toBe(true) // 2:a januari + 60 = 62
      expect(personnummerValidator('19700171-0008')).toBe(true) // 11:e januari + 60 = 71
    })

    test('ska hantera skottår korrekt', () => {
      // 29 februari på skottår
      expect(personnummerValidator('20000229-0005')).toBe(true)
      expect(personnummerValidator('19960229-0000')).toBe(true)
    })
  })

  describe('Ogiltiga personnummer', () => {
    test('ska avvisa tomt eller null värde', () => {
      expect(personnummerValidator('')).toBe(false)
      expect(personnummerValidator(null as any)).toBe(false)
      expect(personnummerValidator(undefined as any)).toBe(false)
    })

    test('ska avvisa fel längd', () => {
      expect(personnummerValidator('123')).toBe(false)
      expect(personnummerValidator('12345678901')).toBe(false) // 11 siffror
      expect(personnummerValidator('1234567890123')).toBe(false) // 13 siffror
    })

    test('ska avvisa ogiltiga datum', () => {
      // Ogiltigt månad
      expect(personnummerValidator('19701302-0304')).toBe(false) // månad 13
      expect(personnummerValidator('19700002-0304')).toBe(false) // månad 00

      // Ogiltigt dag
      expect(personnummerValidator('19700132-0304')).toBe(false) // 32:a januari
      expect(personnummerValidator('19700200-0304')).toBe(false) // 0:e februari
      expect(personnummerValidator('19700231-0304')).toBe(false) // 31:a februari
      
      // 29 februari på icke-skottår
      expect(personnummerValidator('19700229-1234')).toBe(false)
      expect(personnummerValidator('19900229-5678')).toBe(false)
    })

    test('ska avvisa ogiltiga kontrollsiffror enligt Luhn', () => {
      expect(personnummerValidator('19700102-0305')).toBe(false) // Fel kontrollsiffra
      expect(personnummerValidator('19850223-1235')).toBe(false) // Fel kontrollsiffra
      expect(personnummerValidator('700102-0305')).toBe(false) // Fel kontrollsiffra
    })

    test('ska avvisa icke-numeriska tecken', () => {
      expect(personnummerValidator('abcd')).toBe(false)
      expect(personnummerValidator('19700102-abcd')).toBe(false)
      expect(personnummerValidator('197a0102-0304')).toBe(false)
    })

    test('ska avvisa ogiltiga samordningsnummer', () => {
      // Dag + 60 men över månadens dagar
      expect(personnummerValidator('19700192-0304')).toBe(false) // 32 + 60 = 92
      expect(personnummerValidator('19700260-0304')).toBe(false) // Februari med dag 00
    })
  })

  describe('Edge cases', () => {
    test('ska hantera århundradesgränser korrekt för 10-siffrigt format', () => {
      // Testa hur systemet hanterar olika århundraden
      const currentYear = new Date().getFullYear()
      const currentTwoDigits = currentYear % 100

      // År som borde tolkas som 2000-talet
      if (currentTwoDigits < 50) {
        expect(personnummerValidator('010101-0007')).toBe(true) // 2001-01-01
        expect(personnummerValidator('700101-0003')).toBe(true) // 1970-01-01
      }
    })

    test('ska hantera extrema datum', () => {
      // Första dagen på året
      expect(personnummerValidator('19700101-0003')).toBe(true)
      
      // Sista dagen på året
      expect(personnummerValidator('19701231-0004')).toBe(true)
    })

    test('ska hantera olika formatmixar', () => {
      expect(personnummerValidator('198112189876')).toBe(true)
      expect(personnummerValidator('19811218-9876')).toBe(true)
      expect(personnummerValidator('811218-9876')).toBe(true)
    })
  })

  describe('Riktiga testpersonnummer', () => {
    // Dessa är officiella testpersonnummer som används i Sverige
    test('ska acceptera officiella testpersonnummer', () => {
      expect(personnummerValidator('19121212-1212')).toBe(true)
      expect(personnummerValidator('20121212-1212')).toBe(true)
      expect(personnummerValidator('121212-1212')).toBe(true)
    })
  })
})

describe('Personnummer Formatering', () => {
  test('ska formatera 12-siffrigt personnummer med bindestreck', () => {
    expect(formatPersonnummer('197001020304')).toBe('19700102-0304')
    expect(formatPersonnummer('198502231234')).toBe('19850223-1234')
  })

  test('ska formatera 10-siffrigt personnummer med bindestreck', () => {
    expect(formatPersonnummer('7001020304')).toBe('700102-0304')
    expect(formatPersonnummer('8502231234')).toBe('850223-1234')
  })

  test('ska behålla redan formaterade personnummer', () => {
    expect(formatPersonnummer('19700102-0304')).toBe('19700102-0304')
    expect(formatPersonnummer('700102-0304')).toBe('700102-0304')
  })

  test('ska ta bort mellanslag och formatera om', () => {
    expect(formatPersonnummer('197001020304')).toBe('19700102-0304')
    expect(formatPersonnummer('19700102 0304')).toBe('19700102-0304')
  })

  test('ska hantera ogiltiga format genom att returnera originalvärdet', () => {
    expect(formatPersonnummer('')).toBe('')
    expect(formatPersonnummer('123')).toBe('123')
    expect(formatPersonnummer('12345678901')).toBe('12345678901')
  })

  test('ska hantera null och undefined', () => {
    expect(formatPersonnummer(null as any)).toBe('')
    expect(formatPersonnummer(undefined as any)).toBe('')
  })
})

describe('Luhn-algoritm validering', () => {
  test('ska korrekt validera Luhn-kontrollsiffror', () => {
    // Testa kända giltiga nummer
    expect(personnummerValidator('8112189876')).toBe(true)  // Känt giltigt nummer
    expect(personnummerValidator('19811218-9876')).toBe(true)
  })

  test('ska avvisa felaktiga Luhn-kontrollsiffror', () => {
    // Samma nummer men med fel kontrollsiffra
    expect(personnummerValidator('8112189877')).toBe(false)  // Fel sista siffra
    expect(personnummerValidator('19811218-9877')).toBe(false)
  })
})

describe('Datumvalidering i personnummer', () => {
  test('ska validera korrekta månader', () => {
    // Testa några månader med giltiga personnummer
    expect(personnummerValidator('19700115-0007')).toBe(true) // Januari
    expect(personnummerValidator('19700215-0006')).toBe(true) // Februari
    expect(personnummerValidator('19700430-0005')).toBe(true) // April
    expect(personnummerValidator('19700531-0003')).toBe(true) // Maj
  })

  test('ska avvisa ogiltiga månader', () => {
    expect(personnummerValidator('19700015-1234')).toBe(false) // Månad 00
    expect(personnummerValidator('19701315-1234')).toBe(false) // Månad 13
  })

  test('ska validera dagar baserat på månad', () => {
    // Februari (28 dagar i icke-skottår)
    expect(personnummerValidator('19700228-0001')).toBe(true)
    expect(personnummerValidator('19700229-1234')).toBe(false)
    
    // April (30 dagar)
    expect(personnummerValidator('19700430-0005')).toBe(true)
    expect(personnummerValidator('19700431-1234')).toBe(false)
    
    // Maj (31 dagar)
    expect(personnummerValidator('19700531-0003')).toBe(true)
  })
})