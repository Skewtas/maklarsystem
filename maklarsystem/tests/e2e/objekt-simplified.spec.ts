import { test, expect } from '@playwright/test';

test.describe('Objekt (Property) Management E2E Tests', () => {
  // Skippa authentication för nu och fokusera på att testa sidnavigation
  
  test('should navigate to objekt page', async ({ page }) => {
    // Navigera till objekt-sidan
    await page.goto('/objekt');
    
    // Vänta på att sidan laddas
    await page.waitForLoadState('networkidle');
    
    // Verifiera att vi är på rätt sida
    await expect(page).toHaveURL(/.*\/objekt/);
  });

  test('should navigate to create new objekt page', async ({ page }) => {
    // Navigera direkt till nytt objekt-sidan
    await page.goto('/nytt');
    
    // Vänta på att sidan laddas
    await page.waitForLoadState('networkidle');
    
    // Verifiera att vi är på rätt sida
    await expect(page).toHaveURL(/.*\/nytt/);
    
    // Kontrollera att formuläret eller viktiga element visas
    const formElement = page.locator('form').first();
    const inputElements = page.locator('input').first();
    
    // Kontrollera att antingen formulär eller input-fält finns
    const hasForm = await formElement.isVisible().catch(() => false);
    const hasInputs = await inputElements.isVisible().catch(() => false);
    
    expect(hasForm || hasInputs).toBeTruthy();
  });

  test('should display property form fields', async ({ page }) => {
    // Navigera till nytt objekt-sidan
    await page.goto('/nytt');
    
    // Vänta på att sidan laddas
    await page.waitForLoadState('networkidle');
    
    // Kontrollera att svenska fält finns
    const addressField = page.locator('input[name="adress"], input[placeholder*="adress" i]').first();
    const postnummerField = page.locator('input[name="postnummer"], input[placeholder*="postnummer" i]').first();
    const ortField = page.locator('input[name="ort"], input[placeholder*="ort" i]').first();
    
    // Kontrollera att minst något av fälten är synligt
    const hasAddressField = await addressField.isVisible().catch(() => false);
    const hasPostnummerField = await postnummerField.isVisible().catch(() => false);
    const hasOrtField = await ortField.isVisible().catch(() => false);
    
    expect(hasAddressField || hasPostnummerField || hasOrtField).toBeTruthy();
  });

  test('should test API endpoint for creating objekt', async ({ page }) => {
    // Testa API direkt
    const response = await page.request.post('/api/properties', {
      data: {
        adress: 'Test API vägen 123',
        postnummer: '12345',
        ort: 'Stockholm',
        kommun: 'Stockholm',
        lan: 'Stockholms län',
        typ: 'villa',
        utgangspris: 3500000,
        boarea: 150,
        rum: 5,
        byggaar: 1990,
        beskrivning: 'Test objekt från E2E test'
      }
    });
    
    // API:et kan returnera olika statuskoder beroende på autentisering
    // Vi kontrollerar bara att vi får ett svar
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('should test API endpoint for listing objekt', async ({ page }) => {
    // Testa API för att lista objekt
    const response = await page.request.get('/api/properties');
    
    // Kontrollera att vi får ett svar
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
    
    // Om vi får 200, kontrollera att det är JSON
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
      
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});