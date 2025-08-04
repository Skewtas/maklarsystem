/**
 * Enhetstester för svenska fastighetsbeteckning-validering
 * Testar fastighetsbeteckningValidator och formatFastighetsbeteckning funktioner
 */

import { fastighetsbeteckningValidator, formatFastighetsbeteckning } from '../swedish.validators'

describe('Fastighetsbeteckning Validering', () => {
  describe('Giltiga fastighetsbeteckningar', () => {
    test('ska acceptera standardformat med kommun, trakt och block:enhet', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Göteborg Centrum 45:67')).toBe(true)
      expect(fastighetsbeteckningValidator('Malmö Limhamn 12:5')).toBe(true)
    })

    test('ska acceptera format med block:enhet:underenhet', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23:4')).toBe(true)
      expect(fastighetsbeteckningValidator('Göteborg Centrum 45:67:89')).toBe(true)
      expect(fastighetsbeteckningValidator('Malmö Limhamn 12:5:6')).toBe(true)
    })

    test('ska acceptera traktnamn med siffror', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm1 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Göteborg Backa2 45:67')).toBe(true)
    })

    test('ska acceptera sammansatta kommunnamn', () => {
      expect(fastighetsbeteckningValidator('Södertälje Centrum 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Täby Kyrka 45:67')).toBe(true)
      expect(fastighetsbeteckningValidator('Västerås Gamla Stan 12:5')).toBe(true)
    })

    test('ska acceptera traktnamn med mellanslag', () => {
      expect(fastighetsbeteckningValidator('Stockholm Gamla Stan 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Göteborg Västra Frölunda 45:67')).toBe(true)
      expect(fastighetsbeteckningValidator('Malmö Västra Hamnen 12:5')).toBe(true)
    })

    test('ska acceptera svenska tecken i namn', () => {
      expect(fastighetsbeteckningValidator('Åre Björnen 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Växjö Ängö 45:67')).toBe(true)
      expect(fastighetsbeteckningValidator('Örebro Näsby 12:5')).toBe(true)
    })

    test('ska acceptera stora nummer', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 999:999')).toBe(true)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 999:999:999')).toBe(true)
    })
  })

  describe('Ogiltiga fastighetsbeteckningar', () => {
    test('ska avvisa tomt eller null värde', () => {
      expect(fastighetsbeteckningValidator('')).toBe(false)
      expect(fastighetsbeteckningValidator(null as any)).toBe(false)
      expect(fastighetsbeteckningValidator(undefined as any)).toBe(false)
    })

    test('ska avvisa format utan kolon', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 123')).toBe(false)
      expect(fastighetsbeteckningValidator('Göteborg Centrum 4567')).toBe(false)
    })

    test('ska avvisa format med för många kolon', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:2:3:4')).toBe(false)
      expect(fastighetsbeteckningValidator('Göteborg Centrum 1:2:3:4:5')).toBe(false)
    })

    test('ska avvisa format utan kommun', () => {
      expect(fastighetsbeteckningValidator('Södermalm 1:23')).toBe(false)
      expect(fastighetsbeteckningValidator('1:23')).toBe(false)
    })

    test('ska avvisa format utan trakt', () => {
      expect(fastighetsbeteckningValidator('Stockholm 1:23')).toBe(false)
    })

    test('ska avvisa negativa nummer', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm -1:23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:-23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23:-4')).toBe(false)
    })

    test('ska avvisa noll som nummer', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 0:23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:0')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23:0')).toBe(false)
    })

    test('ska avvisa icke-numeriska värden efter kolon', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm a:23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:b')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23:c')).toBe(false)
    })

    test('ska avvisa format med specialtecken i felaktiga positioner', () => {
      expect(fastighetsbeteckningValidator('Stockholm Söder-malm 1:23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1.23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1/23')).toBe(false)
    })

    test('ska avvisa format som börjar med nummer', () => {
      expect(fastighetsbeteckningValidator('123 Stockholm 1:23')).toBe(false)
    })

    test('ska avvisa format med decimaler', () => {
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1.5:23')).toBe(false)
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23.4')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    test('ska hantera extra mellanslag', () => {
      expect(fastighetsbeteckningValidator('  Stockholm   Södermalm   1:23  ')).toBe(true)
      expect(fastighetsbeteckningValidator('Stockholm  Södermalm  1:23')).toBe(true)
    })

    test('ska hantera långa namn', () => {
      const longName = 'Stockholm Stockholms Längsta Traktnamn Någonsin'
      expect(fastighetsbeteckningValidator(`${longName} 1:23`)).toBe(true)
    })

    test('ska hantera kortaste möjliga giltiga format', () => {
      expect(fastighetsbeteckningValidator('A B 1:1')).toBe(true)
    })

    test('ska hantera versaler och gemener korrekt', () => {
      expect(fastighetsbeteckningValidator('STOCKHOLM SÖDERMALM 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('stockholm södermalm 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Stockholm södermalm 1:23')).toBe(true)
    })
  })

  describe('Riktiga fastighetsbeteckningar', () => {
    test('ska acceptera kända svenska fastighetsbeteckningar', () => {
      // Exempel på riktiga svenska fastighetsbeteckningar
      expect(fastighetsbeteckningValidator('Stockholm Södermalm 1:23')).toBe(true)
      expect(fastighetsbeteckningValidator('Göteborg Centrum 15:4')).toBe(true)
      expect(fastighetsbeteckningValidator('Malmö Väster 8:12')).toBe(true)
      expect(fastighetsbeteckningValidator('Uppsala Centrum 5:7')).toBe(true)
    })

    test('ska acceptera fastighetsbeteckningar med underenheter', () => {
      expect(fastighetsbeteckningValidator('Stockholm Östermalm 2:15:3')).toBe(true)
      expect(fastighetsbeteckningValidator('Göteborg Majorna 7:8:1')).toBe(true)
    })
  })

  describe('Specialfall för svenska kommuner', () => {
    test('ska acceptera kända svenska kommunnamn', () => {
      const kommuner = [
        'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås',
        'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'
      ]

      kommuner.forEach(kommun => {
        expect(fastighetsbeteckningValidator(`${kommun} Centrum 1:1`)).toBe(true)
      })
    })

    test('ska hantera kommuner med specialtecken', () => {
      const specialKommuner = [
        'Åre', 'Älmhult', 'Ängelholm', 'Östra Göinge', 
        'Åstorp', 'Älvkarleby', 'Örnsköldsvik'
      ]

      specialKommuner.forEach(kommun => {
        expect(fastighetsbeteckningValidator(`${kommun} Centrum 1:1`)).toBe(true)
      })
    })
  })
})

describe('Fastighetsbeteckning Formatering', () => {
  test('ska rensa bort extra mellanslag', () => {
    expect(formatFastighetsbeteckning('  Stockholm   Södermalm   1:23  '))
      .toBe('Stockholm Södermalm 1:23')
    expect(formatFastighetsbeteckning('Stockholm  Södermalm  1:23'))
      .toBe('Stockholm Södermalm 1:23')
  })

  test('ska behålla korrekt formaterade beteckningar', () => {
    expect(formatFastighetsbeteckning('Stockholm Södermalm 1:23'))
      .toBe('Stockholm Södermalm 1:23')
    expect(formatFastighetsbeteckning('Göteborg Centrum 45:67:89'))
      .toBe('Göteborg Centrum 45:67:89')
  })

  test('ska hantera tomma värden', () => {
    expect(formatFastighetsbeteckning('')).toBe('')
    expect(formatFastighetsbeteckning(null as any)).toBe('')
    expect(formatFastighetsbeteckning(undefined as any)).toBe('')
  })

  test('ska hantera specialtecken genom att bara rensa mellanslag', () => {
    expect(formatFastighetsbeteckning('Stockholm Söder-malm 1:23'))
      .toBe('Stockholm Söder-malm 1:23')
  })

  test('ska hantera mycket långa beteckningar', () => {
    const longDesignation = '   Stockholm    Väldigt    Långt    Traktnamn    123:456:789   '
    expect(formatFastighetsbeteckning(longDesignation))
      .toBe('Stockholm Väldigt Långt Traktnamn 123:456:789')
  })
})

describe('Fullständig fastighetsbeteckning workflow', () => {
  test('ska hantera validering och formatering tillsammans', () => {
    const testCases = [
      {
        input: '  Stockholm   Södermalm   1:23  ',
        expectedFormatted: 'Stockholm Södermalm 1:23',
        shouldBeValid: true
      },
      {
        input: 'Göteborg Centrum 45:67:89',
        expectedFormatted: 'Göteborg Centrum 45:67:89',
        shouldBeValid: true
      },
      {
        input: 'Invalid Format',
        expectedFormatted: 'Invalid Format',
        shouldBeValid: false
      }
    ]

    testCases.forEach(({ input, expectedFormatted, shouldBeValid }) => {
      // Validera originalinput
      expect(fastighetsbeteckningValidator(input)).toBe(shouldBeValid)
      
      // Formatera
      const formatted = formatFastighetsbeteckning(input)
      expect(formatted).toBe(expectedFormatted)
      
      // Validera formaterad version (om den ursprungliga var giltig)
      if (shouldBeValid) {
        expect(fastighetsbeteckningValidator(formatted)).toBe(true)
      }
    })
  })

  test('ska hantera ogiltiga beteckningar genom hela processen', () => {
    const invalidInput = 'Stockholm 1:23' // Saknar trakt
    
    // Ska vara ogiltig från början
    expect(fastighetsbeteckningValidator(invalidInput)).toBe(false)
    
    // Formatering ska fungera ändå
    const formatted = formatFastighetsbeteckning(invalidInput)
    expect(formatted).toBe('Stockholm 1:23')
    
    // Ska fortfarande vara ogiltig efter formatering
    expect(fastighetsbeteckningValidator(formatted)).toBe(false)
  })
})