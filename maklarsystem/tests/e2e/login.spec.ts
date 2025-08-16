import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Auth redirects', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(`${BASE_URL}/nytt`)
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login`))
  })

  test('sign out redirects to /login', async ({ page }) => {
    await page.request.post(`${BASE_URL}/auth/signout`).catch(() => {})
    await page.waitForTimeout(200)
    await page.goto(`${BASE_URL}/nytt`)
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login`))
  })
})


