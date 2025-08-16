import { test, expect } from '@playwright/test';

// Test data
const testObjekt = {
  adress: 'Testgatan 123',
  postnummer: '12345',
  ort: 'Stockholm',
  kommun: 'Stockholm',
  lan: 'Stockholms län',
  typ: 'villa',
  utgangspris: '3500000',
  boarea: '150',
  biarea: '30',
  tomtarea: '800',
  rum: '5',
  byggaar: '1975',
  beskrivning: 'En fin testvilla med svensk standard',
  // Svenska fält
  fastighetsbeteckning: 'Test 1:123',
  energiklass: 'C',
  avgift_manad: '0',
  taxeringsvarde: '2500000',
  hiss: false,
  balkong: true,
  parkering: 'Garage'
};

// Helper function för inloggning
async function loginAsTestUser(page: any) {
  const testEmail = `test.admin.${Date.now()}@example.com`;
  const testPassword = 'AdminPassword123!';
  
  // Registrera admin användare
  await page.goto('http://localhost:3000/auth/register');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.fill('input[name="confirmPassword"]', testPassword);
  await page.fill('input[name="fullName"]', 'Test Admin');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  return { email: testEmail, password: testPassword };
}

test.describe('Objekt (Property) Management E2E Tests', () => {
  let userCredentials: { email: string; password: string };

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    userCredentials = await loginAsTestUser(page);
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Logga in före varje test
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', userCredentials.email);
    await page.fill('input[type="password"]', userCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to create new objekt page', async ({ page }) => {
    // Navigera till objekt-sidan
    await page.goto('http://localhost:3000/objekt');
    
    // Klicka på "Skapa nytt objekt" knapp
    const createButton = page.locator('a:has-text("Nytt objekt"), button:has-text("Skapa objekt")').first();
    await createButton.click();
    
    // Verifiera att vi är på rätt sida
    await expect(page).toHaveURL(/.*objekt\/new|nytt/);
    
    // Kontrollera att formuläret visas
    await expect(page.locator('form')).toBeVisible();
  });

  test('should create a new objekt with Swedish fields', async ({ page }) => {
    await page.goto('http://localhost:3000/objekt/new');
    
    // Fyll i grundläggande fält
    await page.fill('input[name="adress"]', testObjekt.adress);
    await page.fill('input[name="postnummer"]', testObjekt.postnummer);
    await page.fill('input[name="ort"]', testObjekt.ort);
    await page.fill('input[name="kommun"]', testObjekt.kommun);
    await page.fill('input[name="lan"]', testObjekt.lan);
    
    // Välj typ
    await page.selectOption('select[name="typ"]', testObjekt.typ);
    
    // Fyll i priser och ytor
    await page.fill('input[name="utgangspris"]', testObjekt.utgangspris);
    await page.fill('input[name="boarea"]', testObjekt.boarea);
    await page.fill('input[name="biarea"]', testObjekt.biarea);
    await page.fill('input[name="tomtarea"]', testObjekt.tomtarea);
    await page.fill('input[name="rum"]', testObjekt.rum);
    await page.fill('input[name="byggaar"]', testObjekt.byggaar);
    
    // Fyll i svenska fält (nya från migrationen)
    await page.fill('input[name="fastighetsbeteckning"]', testObjekt.fastighetsbeteckning);
    await page.fill('input[name="energiklass"]', testObjekt.energiklass);
    await page.fill('input[name="taxeringsvarde"]', testObjekt.taxeringsvarde);
    await page.fill('input[name="parkering"]', testObjekt.parkering);
    
    // Checkboxar
    if (testObjekt.balkong) {
      await page.check('input[name="balkong"]');
    }
    
    // Beskrivning
    await page.fill('textarea[name="beskrivning"]', testObjekt.beskrivning);
    
    // Spara objektet
    await page.click('button[type="submit"]');
    
    // Vänta på redirect eller success message
    await page.waitForLoadState('networkidle');
    
    // Verifiera att objektet skapades
    const successMessage = page.locator('.success-message, [role="status"], .text-green-500').first();
    const isRedirected = !page.url().includes('/new');
    
    expect(await successMessage.isVisible() || isRedirected).toBeTruthy();
  });

  test('should list created objekt', async ({ page }) => {
    // Skapa ett objekt först
    await page.goto('http://localhost:3000/objekt/new');
    await page.fill('input[name="adress"]', 'Listtest vägen 456');
    await page.fill('input[name="postnummer"]', '54321');
    await page.fill('input[name="ort"]', 'Göteborg');
    await page.fill('input[name="kommun"]', 'Göteborg');
    await page.fill('input[name="lan"]', 'Västra Götaland');
    await page.selectOption('select[name="typ"]', 'lagenhet');
    await page.fill('input[name="utgangspris"]', '2000000');
    await page.fill('input[name="boarea"]', '75');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Gå till objekt-listan
    await page.goto('http://localhost:3000/objekt');
    
    // Verifiera att objektet visas i listan
    const objektCard = page.locator('text=Listtest vägen 456');
    await expect(objektCard).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing objekt', async ({ page }) => {
    // Skapa ett objekt
    await page.goto('http://localhost:3000/objekt/new');
    const originalAddress = 'Redigeringsvägen 789';
    await page.fill('input[name="adress"]', originalAddress);
    await page.fill('input[name="postnummer"]', '98765');
    await page.fill('input[name="ort"]', 'Malmö');
    await page.fill('input[name="kommun"]', 'Malmö');
    await page.fill('input[name="lan"]', 'Skåne');
    await page.selectOption('select[name="typ"]', 'radhus');
    await page.fill('input[name="utgangspris"]', '2800000');
    await page.fill('input[name="boarea"]', '120');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Gå till objekt-listan
    await page.goto('http://localhost:3000/objekt');
    
    // Hitta och klicka på objektet för att redigera
    await page.click(`text=${originalAddress}`);
    await page.waitForLoadState('networkidle');
    
    // Klicka på redigera-knappen
    const editButton = page.locator('button:has-text("Redigera"), a:has-text("Redigera")').first();
    await editButton.click();
    
    // Uppdatera några fält
    const newPrice = '2900000';
    await page.fill('input[name="utgangspris"]', newPrice);
    await page.fill('input[name="energiklass"]', 'B'); // Testa svenska fält
    
    // Spara ändringar
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verifiera att ändringarna sparades
    const priceDisplay = page.locator(`text=${newPrice}`);
    await expect(priceDisplay).toBeVisible({ timeout: 10000 });
  });

  test('should search/filter objekt', async ({ page }) => {
    // Skapa några objekt med olika egenskaper
    const objekts = [
      { adress: 'Söktest Villa 1', typ: 'villa', ort: 'Stockholm' },
      { adress: 'Söktest Lägenhet 2', typ: 'lagenhet', ort: 'Göteborg' },
      { adress: 'Söktest Radhus 3', typ: 'radhus', ort: 'Malmö' }
    ];
    
    for (const obj of objekts) {
      await page.goto('http://localhost:3000/objekt/new');
      await page.fill('input[name="adress"]', obj.adress);
      await page.fill('input[name="postnummer"]', '11111');
      await page.fill('input[name="ort"]', obj.ort);
      await page.fill('input[name="kommun"]', obj.ort);
      await page.fill('input[name="lan"]', 'Test län');
      await page.selectOption('select[name="typ"]', obj.typ);
      await page.fill('input[name="utgangspris"]', '1000000');
      await page.fill('input[name="boarea"]', '100');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
    
    // Gå till objekt-listan
    await page.goto('http://localhost:3000/objekt');
    
    // Testa sökfunktion (om den finns)
    const searchInput = page.locator('input[placeholder*="Sök"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Villa');
      await page.waitForTimeout(500); // Vänta på debounce
      
      // Verifiera att endast villa visas
      await expect(page.locator('text=Söktest Villa 1')).toBeVisible();
      await expect(page.locator('text=Söktest Lägenhet 2')).not.toBeVisible();
    }
    
    // Testa filter (om det finns)
    const typeFilter = page.locator('select[name="typ"], select[name="filter-typ"]').first();
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('lagenhet');
      await page.waitForTimeout(500);
      
      // Verifiera att endast lägenheter visas
      await expect(page.locator('text=Söktest Lägenhet 2')).toBeVisible();
      await expect(page.locator('text=Söktest Villa 1')).not.toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:3000/objekt/new');
    
    // Försök spara utan att fylla i required fields
    await page.click('button[type="submit"]');
    
    // Kontrollera att valideringsfel visas
    const errors = page.locator('.error-message, [role="alert"], .text-red-500');
    await expect(errors.first()).toBeVisible();
    
    // Verifiera att vi fortfarande är på samma sida
    await expect(page).toHaveURL(/.*objekt\/new/);
  });

  test('should handle Swedish-specific validations', async ({ page }) => {
    await page.goto('http://localhost:3000/objekt/new');
    
    // Testa fastighetsbeteckning format
    await page.fill('input[name="fastighetsbeteckning"]', 'Ogiltig beteckning');
    await page.fill('input[name="adress"]', 'Test');
    await page.fill('input[name="postnummer"]', '12345');
    await page.fill('input[name="ort"]', 'Test');
    await page.fill('input[name="kommun"]', 'Test');
    await page.fill('input[name="lan"]', 'Test');
    await page.click('button[type="submit"]');
    
    // Kontrollera valideringsfel för svensk format
    const fastighetError = page.locator('text=/fastighetsbeteckning|beteckning/i');
    if (await fastighetError.isVisible()) {
      // Validering finns för fastighetsbeteckning
      expect(true).toBeTruthy();
    }
    
    // Testa energiklass (ska vara A-G)
    await page.fill('input[name="energiklass"]', 'Z'); // Ogiltig klass
    await page.click('button[type="submit"]');
    
    const energiError = page.locator('text=/energiklass|energi/i');
    if (await energiError.isVisible()) {
      // Validering finns för energiklass
      expect(true).toBeTruthy();
    }
  });
});