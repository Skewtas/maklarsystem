import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3002'
const EMAIL = process.env.E2E_TEST_EMAIL || 'e2e@example.com'
const PASSWORD = process.env.E2E_TEST_PASSWORD || 'testpassword123'

test('logs in via test API and reaches dashboard', async ({ page }) => {
  // Ensure fresh context
  await page.context().clearCookies()

  // Use server-side test endpoint to create or update user password
  const createResp = await page.request.get(`${BASE}/api/test/create-user?email=${encodeURIComponent(EMAIL)}&password=${encodeURIComponent(PASSWORD)}`)
  expect(createResp.ok()).toBeTruthy()

  // Sign in via test endpoint to set auth cookies in the browser context
  const loginResp = await page.request.post(`${BASE}/api/test/login`, {
    data: { email: EMAIL, password: PASSWORD }
  })
  expect(loginResp.ok()).toBeTruthy()

  // Navigate to home (should be authenticated)
  await page.goto(`${BASE}/`)

  // Expect not to be on login page
  await expect(page).not.toHaveURL(new RegExp(`${BASE}/login`))
})



