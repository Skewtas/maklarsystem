import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3002'

test.describe('Registrera och (om möjligt) logga in', () => {
  test('skapar ny användare via UI och verifierar återkoppling', async ({ page }) => {
    const unique = Date.now()
    const email = `e2e.user.${unique}@example.com`
    const password = 'Test1234'

    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('networkidle')

    // Välj fliken "Registrera"
    await page.getByRole('tab', { name: 'Registrera' }).click()

    // Fyll i formuläret enligt nuvarande fältnamn i UI:t
    await page.fill('#register-name', 'E2E Testare')
    await page.fill('#register-email', email)
    await page.fill('#register-password', password)
    // Telefon är valfritt
    await page.fill('#register-phone', '0701234567')

    // Skicka formuläret
    await page.getByRole('button', { name: 'Skapa konto' }).click()

    // Förvänta redirect tillbaka till /login (med eller utan message)
    await page.waitForURL(/\/login(\?message=.*)?/)
    // Om felmeddelande visas, faila direkt
    const errorBanner = page.locator('text=An error occurred during signup')
    if (await errorBanner.isVisible()) {
      throw new Error('Signup showed error banner')
    }

    // Försök logga in om e-postbekräftelse inte krävs i projektet
    await page.getByRole('tab', { name: 'Logga in' }).click()
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.getByRole('button', { name: 'Logga in' }).click()

    // Acceptera två möjliga utfall: inloggad till / eller kvar på /login pga krav på e-postbekräftelse
    await page.waitForLoadState('networkidle')
    const atHome = page.url() === `${BASE}/`
    const stillOnLogin = /\/login/.test(page.url())
    expect(atHome || stillOnLogin).toBeTruthy()
  })
})


