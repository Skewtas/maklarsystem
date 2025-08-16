import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'rani.shakir@hotmail.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || '123456'

test('login, create objekt, open Bilder and upload one image (chromium)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium-only test')

  // Ensure test user exists
  const createUserRes = await page.request.get(`${BASE_URL}/api/test/create-user?email=${encodeURIComponent(TEST_EMAIL)}&password=${encodeURIComponent(TEST_PASSWORD)}`)
  if (!createUserRes.ok()) {
    console.log('create-user failed:', await createUserRes.text())
  }

  // Login via API so cookies are set in the same browser context
  const loginRes = await page.request.post(`${BASE_URL}/api/test/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD }
  })
  if (!loginRes.ok()) {
    console.log('login failed:', await loginRes.text())
  }

  // Create a fresh objekt owned by the test user and get its id
  const createObjRes = await page.request.post(`${BASE_URL}/api/test/create-objekt`, {
    data: { email: TEST_EMAIL }
  })
  if (!createObjRes.ok()) {
    console.log('create-objekt failed:', await createObjRes.text())
  }
  const created = await createObjRes.json().catch(() => ({} as any))
  const TEST_OBJEKT_ID = created?.data?.id as string

  // Navigate directly to Bilder tab
  await page.goto(`${BASE_URL}/objekt/${TEST_OBJEKT_ID}?tab=bilder`)
  await page.waitForURL(new RegExp(`/objekt/${TEST_OBJEKT_ID.replace(/[-]/g, '\\-')}`))

  // Wait for Bilder section controls (disambiguated selectors)
  await expect(page.getByRole('heading', { name: 'Bilder' })).toBeVisible({ timeout: 15000 })
  await expect(page.locator('label', { hasText: 'Ladda upp bilder' })).toBeVisible({ timeout: 15000 })

  // Prepare small in-memory PNG
  const fileName = 'test.png'
  const content = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=', 'base64')

  // Upload and wait for the POST /images response (capture first)
  const uploadResponsePromise = page.waitForResponse((resp) => /\/api\/properties\/.+\/images$/.test(resp.url()) && resp.request().method() === 'POST')
  await page.setInputFiles('input[type="file"]', { name: fileName, mimeType: 'image/png', buffer: content })
  const uploadResp = await uploadResponsePromise
  try {
    const status = uploadResp.status()
    if (status !== 200) {
      const bodyText = await uploadResp.text().catch(() => '')
      console.log('Upload failed:', { status, bodyText })
    }
  } catch {}

  // Wait for UI state: either the actual image is visible or preview placeholder appears
  try {
    await expect(page.getByAltText('Objektbild')).toBeVisible({ timeout: 20000 })
  } catch {
    await expect(page.getByText('Förhandsvisning genereras...')).toBeVisible({ timeout: 20000 })
  }

  // Expect gallery not empty (empty-state text gone)
  await expect(page.getByText('Inga bilder uppladdade ännu.')).toHaveCount(0)
})


