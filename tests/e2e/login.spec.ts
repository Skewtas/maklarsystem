import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'anna.andersson@maklarsystem.se'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'testpassword123'

test.describe('Login flow', () => {
  test('redirects unauthenticated to /login and logs in successfully', async ({ page }) => {
    // Ensure clean state
    await page.context().clearCookies()
    // Ensure test user exists (and password set)
    await page.request.get(`${BASE_URL}/api/test/create-user?email=${encodeURIComponent(TEST_EMAIL)}&password=${encodeURIComponent(TEST_PASSWORD)}`)
    // Perform login via API to set auth cookies, then verify UI access
    await page.request.post(`${BASE_URL}/api/test/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD }
    })
    await page.goto(`${BASE_URL}/nytt`)

    // Should redirect to /login
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login`))

    // Fill login form
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Expect redirect to home
    // Expect being authenticated now
    await expect(page).not.toHaveURL(new RegExp('/login$'))
  })

  test('sign out redirects to /login', async ({ page }) => {
    // Directly call POST signout to avoid GET navigation issues
    await page.request.post(`${BASE_URL}/auth/signout`).catch(() => {})
    await page.waitForTimeout(300)
    // Access a protected page to assert redirect
    await page.goto(`${BASE_URL}/nytt`)
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login`))
  })
})


