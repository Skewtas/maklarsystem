import { test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test('Login then create objekt; log console and network', async ({ page }) => {
  page.on('console', msg => {
    // eslint-disable-next-line no-console
    console.log(`[browser:${msg.type()}]`, msg.text())
  })
  page.on('requestfailed', req => {
    // eslint-disable-next-line no-console
    console.log(`[requestfailed] ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`)
  })
  page.on('response', res => {
    // eslint-disable-next-line no-console
    console.log(`[response] ${res.status()} ${res.url()}`)
  })

  // Login
  await page.goto(`${BASE_URL}/login`)
  await page.fill('#login-email', 'rani.shakir@hotmail.com')
  await page.fill('#login-password', '123456')
  await page.click('button[type="submit"]:has-text("Logga in")')
  await page.waitForURL(`${BASE_URL}/`)

  // Create objekt
  await page.goto(`${BASE_URL}/nytt`)
  await page.fill('input[name="sokbegrepp"]', 'E2E Debug')
  await page.selectOption('select[name="typ"]', 'lagenhet')
  await page.selectOption('select[name="upplatelse_form"]', 'bostadsratt')
  await page.fill('input[name="adress"]', 'Gårdsfogdevägen 24')
  await page.fill('input[name="postnummer"]', '123 45')
  await page.fill('input[name="ort"]', 'Stockholm')
  await page.fill('input[name="kommun"]', 'Stockholm')
  await page.click('button:has-text("Spara Objekt")')
  await page.waitForTimeout(3000)

  // Go to detail and upload a small image
  // We were redirected to detail; click the tab by role/name to be robust
  await page.getByRole('tab', { name: 'Bilder' }).click()
  // Create a dummy file in memory and upload via setInputFiles
  const fileName = 'test.png'
  const content = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
    'base64'
  )
  await page.setInputFiles('input[type="file"]', {
    name: fileName,
    mimeType: 'image/png',
    buffer: content
  })
  await page.waitForTimeout(1500)
})


