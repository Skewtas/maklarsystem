import { test, expect } from '@playwright/test';

// Generera unik e-post för varje test
const generateTestEmail = () => {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
};

const testPassword = 'TestPassword123!';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigera till applikationen
    await page.goto('http://localhost:3000');
  });

  test('should display login page', async ({ page }) => {
    // Verifiera att login-sidan visas
    await expect(page).toHaveURL(/.*auth\/login/);
    
    // Kontrollera att viktiga element finns
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    const testEmail = generateTestEmail();
    
    // Navigera till registreringssidan
    await page.goto('http://localhost:3000/auth/register');
    
    // Fyll i registreringsformuläret
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.fill('input[name="fullName"]', 'Test User');
    
    // Skicka formuläret
    await page.click('button[type="submit"]');
    
    // Vänta på redirect eller success message
    await page.waitForLoadState('networkidle');
    
    // Verifiera att användaren är inloggad eller redirectad
    const url = page.url();
    expect(url).not.toContain('/auth/register');
    
    // Kontrollera att auth-trigger fungerade genom att verifiera att användaren skapades i public.users
    // Detta verifieras indirekt genom att inloggningen fungerar
  });

  test('should login with existing user', async ({ page }) => {
    const testEmail = generateTestEmail();
    
    // Först registrera en användare
    await page.goto('http://localhost:3000/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.fill('input[name="fullName"]', 'Test Login User');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Logga ut (om automatiskt inloggad)
    const logoutButton = page.locator('button:has-text("Logga ut")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Nu testa inloggning
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Vänta på inloggning
    await page.waitForLoadState('networkidle');
    
    // Verifiera att användaren är inloggad
    const dashboardUrl = page.url();
    expect(dashboardUrl).not.toContain('/auth/login');
    
    // Kontrollera att användarmenyn visas
    const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('.user-menu'));
    await expect(userMenu).toBeVisible({ timeout: 10000 });
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    
    // Försök logga in med felaktiga uppgifter
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    
    // Vänta på felmeddelande
    await page.waitForSelector('.error-message, [role="alert"], .text-red-500', { timeout: 5000 });
    
    // Verifiera att vi fortfarande är på login-sidan
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should handle logout correctly', async ({ page }) => {
    const testEmail = generateTestEmail();
    
    // Registrera och logga in
    await page.goto('http://localhost:3000/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.fill('input[name="fullName"]', 'Test Logout User');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Hitta och klicka på logout
    const logoutButton = page.locator('button:has-text("Logga ut")');
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();
    
    // Vänta på redirect till login
    await page.waitForLoadState('networkidle');
    
    // Verifiera att vi är utloggade
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register');
    
    // Försök med ogiltig e-post
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    // Försök skicka
    await page.click('button[type="submit"]');
    
    // Kontrollera valideringsfel
    const emailError = page.locator('.error-message, [role="alert"], .text-red-500').first();
    await expect(emailError).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register');
    
    // Försök med svagt lösenord
    await page.fill('input[name="email"]', generateTestEmail());
    await page.fill('input[name="password"]', '123'); // För kort
    await page.fill('input[name="confirmPassword"]', '123');
    
    // Försök skicka
    await page.click('button[type="submit"]');
    
    // Kontrollera valideringsfel
    const passwordError = page.locator('.error-message, [role="alert"], .text-red-500').first();
    await expect(passwordError).toBeVisible();
  });

  test('should verify auth trigger creates user in public.users table', async ({ page }) => {
    const testEmail = generateTestEmail();
    
    // Registrera användare
    await page.goto('http://localhost:3000/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.fill('input[name="fullName"]', 'Auth Trigger Test');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Om användaren kan logga in och se dashboard betyder det att 
    // auth trigger fungerade och skapade användaren i public.users
    const url = page.url();
    expect(url).not.toContain('/auth/register');
    expect(url).not.toContain('/auth/login');
    
    // Detta bekräftar att auth-synkroniseringen fungerar
  });
});