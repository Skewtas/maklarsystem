/**
 * Enhetstester för svenska organisationsnummer-validering
 * Testar organisationsnummerValidator och formatOrganisationsnummer funktioner
 */

import { organisationsnummerValidator, formatOrganisationsnummer } from '../swedish.validators'

describe('Organisationsnummer Validering', () => {
  describe('Giltiga organisationsnummer', () => {
    test('ska acceptera giltiga organisationsnummer utan bindestreck', () => {
      // Giltiga svenska organisationsnummer
      expect(organisationsnummerValidator('5560000001')).toBe(true) // Testorganisation
      expect(organisationsnummerValidator('2000000006')).toBe(true) // Statligt
      expect(organisationsnummerValidator('8020000009')).toBe(true) // Ekonomisk förening
    })

    test('ska acceptera organisationsnummer med bindestreck', () => {
      expect(organisationsnummerValidator('556000-0001')).toBe(true)
      expect(organisationsnummerValidator('200000-0006')).toBe(true)
      expect(organisationsnummerValidator('802000-0009')).toBe(true)
    })

    test('ska acceptera organisationsnummer med mellanslag', () => {
      expect(organisationsnummerValidator('556000 0001')).toBe(true)
      expect(organisationsnummerValidator('200000 0006')).toBe(true)
    })

    test('ska acceptera olika organisationstyper baserat på första siffran', () => {
      // 2 = Statlig myndighet
      expect(organisationsnummerValidator('2000000006')).toBe(true)
      
      // 3 = Kommun eller landsting
      expect(organisationsnummerValidator('3120000009')).toBe(true)
      
      // 5 = Aktiebolag
      expect(organisationsnummerValidator('5560000001')).toBe(true)
      
      // 6 = Enkilda firmor (F-skatt)
      expect(organisationsnummerValidator('6120000002')).toBe(true)
      
      // 7 = Ekonomiska föreningar, ideella föreningar
      expect(organisationsnummerValidator('7020000001')).toBe(true)
      
      // 8 = Ekonomiska föreningar
      expect(organisationsnummerValidator('8020000009')).toBe(true)
      
      // 9 = Övriga organisationer
      expect(organisationsnummerValidator('9020000007')).toBe(true)
    })
  })

  describe('Ogiltiga organisationsnummer', () => {
    test('ska avvisa tomt eller null värde', () => {
      expect(organisationsnummerValidator('')).toBe(false)
      expect(organisationsnummerValidator(null as any)).toBe(false)
      expect(organisationsnummerValidator(undefined as any)).toBe(false)
    })

    test('ska avvisa fel längd', () => {
      expect(organisationsnummerValidator('123')).toBe(false)
      expect(organisationsnummerValidator('12345678901')).toBe(false) // 11 siffror
      expect(organisationsnummerValidator('123456789')).toBe(false) // 9 siffror
    })

    test('ska avvisa första siffran 0 eller 1', () => {
      expect(organisationsnummerValidator('0120000000')).toBe(false) // Börjar med 0
      expect(organisationsnummerValidator('1120000000')).toBe(false) // Börjar med 1
    })

    test('ska avvisa ogiltiga kontrollsiffror enligt Luhn', () => {
      expect(organisationsnummerValidator('5560000002')).toBe(false) // Fel kontrollsiffra
      expect(organisationsnummerValidator('2120000143')).toBe(false) // Fel kontrollsiffra
      expect(organisationsnummerValidator('556000-0002')).toBe(false) // Fel kontrollsiffra med bindestreck
    })

    test('ska avvisa icke-numeriska tecken', () => {
      expect(organisationsnummerValidator('abcdefghij')).toBe(false)
      expect(organisationsnummerValidator('556000-abcd')).toBe(false)
      expect(organisationsnummerValidator('556a000001')).toBe(false)
    })

    test('ska avvisa nummer med specialtecken (förutom tillåtna)', () => {
      expect(organisationsnummerValidator('556000/0001')).toBe(false)
      expect(organisationsnummerValidator('556000.0001')).toBe(false)
      expect(organisationsnummerValidator('556000_0001')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    test('ska hantera blandade format korrekt', () => {
      expect(organisationsnummerValidator('556000-0001')).toBe(true)
      expect(organisationsnummerValidator('556000 0001')).toBe(true)
      expect(organisationsnummerValidator('5560000001')).toBe(true)
    })

    test('ska hantera extrema giltiga värden', () => {
      // Testa med olika organisationstyper
      expect(organisationsnummerValidator('2000000006')).toBe(true) // Minsta möjliga med 2
      expect(organisationsnummerValidator('9020000007')).toBe(true) // Stort nummer med 9
    })

    test('ska hantera blandat formatering', () => {
      const mixedFormat = '556000-0001'
      expect(organisationsnummerValidator(mixedFormat)).toBe(true)
    })
  })

  describe('Riktiga testorganisationsnummer', () => {
    // Dessa är kända testorganisationsnummer som används i Sverige
    test('ska acceptera officiella testorganisationsnummer', () => {
      expect(organisationsnummerValidator('5560000001')).toBe(true) // Standardtest
      expect(organisationsnummerValidator('2120000142')).toBe(true) // Statlig test
    })
  })

  describe('Organisationstyper', () => {
    test('ska identifiera olika organisationstyper korrekt', () => {
      const testCases = [
        { number: '2000000006', type: 'Statlig myndighet' },
        { number: '3120000009', type: 'Kommun/Landsting' },
        { number: '5560000001', type: 'Aktiebolag' },
        { number: '6120000002', type: 'Enskild firma' },
        { number: '7020000001', type: 'Förening' },
        { number: '8020000009', type: 'Ekonomisk förening' },
        { number: '9020000007', type: 'Övrig organisation' }
      ]

      testCases.forEach(({ number }) => {
        expect(organisationsnummerValidator(number)).toBe(true)
      })
    })
  })
})

describe('Organisationsnummer Formatering', () => {
  test('ska formatera organisationsnummer med bindestreck', () => {
    expect(formatOrganisationsnummer('5560000001')).toBe('556000-0001')
    expect(formatOrganisationsnummer('2120000142')).toBe('212000-0142')
    expect(formatOrganisationsnummer('8020000000')).toBe('802000-0000')
  })

  test('ska behålla redan formaterade organisationsnummer', () => {
    expect(formatOrganisationsnummer('556000-0001')).toBe('556000-0001')
    expect(formatOrganisationsnummer('212000-0142')).toBe('212000-0142')
  })

  test('ska ta bort mellanslag och formatera om', () => {
    expect(formatOrganisationsnummer('556000 0001')).toBe('556000-0001')
    expect(formatOrganisationsnummer('212000 0142')).toBe('212000-0142')
  })

  test('ska hantera ogiltiga format genom att returnera originalvärdet', () => {
    expect(formatOrganisationsnummer('')).toBe('')
    expect(formatOrganisationsnummer('123')).toBe('123')
    expect(formatOrganisationsnummer('12345678901')).toBe('12345678901')
  })

  test('ska hantera null och undefined', () => {
    expect(formatOrganisationsnummer(null as any)).toBe('')
    expect(formatOrganisationsnummer(undefined as any)).toBe('')
  })
})

describe('Luhn-algoritm för organisationsnummer', () => {
  test('ska korrekt validera Luhn-kontrollsiffror för organisationsnummer', () => {
    // Testa kända giltiga organisationsnummer
    expect(organisationsnummerValidator('5560000001')).toBe(true)
    expect(organisationsnummerValidator('2120000142')).toBe(true)
  })

  test('ska avvisa felaktiga Luhn-kontrollsiffror', () => {
    // Samma nummer men med fel kontrollsiffra
    expect(organisationsnummerValidator('5560000002')).toBe(false) // Fel sista siffra
    expect(organisationsnummerValidator('2120000143')).toBe(false) // Fel sista siffra
  })

  test('ska hantera alla möjliga kontrollsiffror', () => {
    // Testa att systemet kan hantera alla siffror 0-9 som kontrollsiffra
    const baseNumbers = ['556000000', '212000014']
    
    baseNumbers.forEach(base => {
      let foundValid = false
      for (let i = 0; i <= 9; i++) {
        const testNumber = base + i.toString()
        if (organisationsnummerValidator(testNumber)) {
          foundValid = true
          break
        }
      }
      expect(foundValid).toBe(true) // Minst en kontrollsiffra ska vara giltig
    })
  })
})

describe('Kompletta organisationsnummer scenarier', () => {
  test('ska hantera fullständig valideringsprocess', () => {
    const testNumber = '5560000001'
    
    // Steg 1: Validera
    expect(organisationsnummerValidator(testNumber)).toBe(true)
    
    // Steg 2: Formatera
    const formatted = formatOrganisationsnummer(testNumber)
    expect(formatted).toBe('556000-0001')
    
    // Steg 3: Validera det formaterade numret
    expect(organisationsnummerValidator(formatted)).toBe(true)
  })

  test('ska hantera ogiltiga nummer i hela processen', () => {
    const invalidNumber = '5560000002'
    
    // Steg 1: Validation ska misslyckas
    expect(organisationsnummerValidator(invalidNumber)).toBe(false)
    
    // Steg 2: Formatering ska ändå fungera
    const formatted = formatOrganisationsnummer(invalidNumber)
    expect(formatted).toBe('556000-0002')
    
    // Steg 3: Det formaterade numret ska fortfarande vara ogiltigt
    expect(organisationsnummerValidator(formatted)).toBe(false)
  })
})