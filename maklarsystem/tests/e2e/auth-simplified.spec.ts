import { test, expect } from '@playwright/test';

// Generera unik e-post för varje test
const generateTestEmail = () => {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
};

const testPassword = 'TestPassword123!';

test.describe('Authentication E2E Tests', () => {
  test('should display login page', async ({ page }) => {
    // Navigera till login-sidan
    await page.goto('/login');
    
    // Verifiera att login-sidan visas
    await expect(page).toHaveURL(/.*\/login/);
    
    // Kontrollera att viktiga element finns
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Logga in")').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Försök logga in med felaktiga uppgifter
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Logga in")').first();
    
    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('WrongPassword123');
    await submitButton.click();
    
    // Vänta lite för att se om felmeddelande visas
    await page.waitForTimeout(2000);
    
    // Verifiera att vi fortfarande är på login-sidan
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // För detta test behöver vi en faktisk användare i databasen
    // Vi kan använda API:et för att skapa en testanvändare först
    const testEmail = generateTestEmail();
    
    // Skapa testanvändare via API (om det finns)
    const createUserResponse = await page.request.post('/api/test/create-user', {
      data: {
        email: testEmail,
        password: testPassword
      }
    });
    
    if (createUserResponse.ok()) {
      // Navigera till login
      await page.goto('/login');
      
      // Logga in
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Logga in")').first();
      
      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);
      await submitButton.click();
      
      // Vänta på redirect
      await page.waitForLoadState('networkidle');
      
      // Verifiera att vi inte längre är på login-sidan
      const url = page.url();
      expect(url).not.toContain('/login');
    }
  });
});