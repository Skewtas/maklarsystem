import { test, expect } from '@playwright/test';

test.describe('Skapa användare', () => {
  test('ska kunna registrera ny användare rani.shakir@matchahem.se', async ({ page }) => {
    // Gå till login-sidan
    await page.goto('http://localhost:3002/login');
    
    // Vänta på att sidan laddas
    await page.waitForLoadState('networkidle');
    
    // Klicka på "Skapa konto" fliken
    await page.click('text=Skapa konto');
    
    // Fyll i registreringsformuläret
    await page.fill('input[name="fullName"]', 'Rani Shakir');
    await page.fill('input[name="email"]', 'rani.shakir@matchahem.se');
    await page.fill('input[name="phone"]', '0762586389');
    await page.fill('input[name="password"]', '123456');
    await page.fill('input[name="confirmPassword"]', '123456');
    
    // Klicka på "Skapa konto" knappen
    await page.click('button:has-text("Skapa konto")');
    
    // Vänta på att se framgångsmeddelandet
    await page.waitForSelector('text=Konto skapat! Kontrollera din e-post för att bekräfta kontot.', {
      timeout: 10000
    });
    
    // Verifiera att vi har bytt till login-fliken
    await expect(page.locator('[data-state="active"]:has-text("Logga in")')).toBeVisible();
    
    console.log('✅ Användare skapad framgångsrikt!');
    console.log('📧 E-post: rani.shakir@matchahem.se');
    console.log('🔑 Lösenord: 123456');
  });
  
  test('ska kunna logga in med nya användaren', async ({ page }) => {
    // Gå till login-sidan
    await page.goto('http://localhost:3002/login');
    
    // Vänta på att sidan laddas
    await page.waitForLoadState('networkidle');
    
    // Se till att vi är på login-fliken
    const loginTab = page.locator('[data-state="active"]:has-text("Logga in")');
    if (!(await loginTab.isVisible())) {
      await page.click('text=Logga in');
    }
    
    // Fyll i inloggningsuppgifter
    await page.fill('input[name="email"]', 'rani.shakir@matchahem.se');
    await page.fill('input[name="password"]', '123456');
    
    // Klicka på "Logga in" knappen
    await page.click('button:has-text("Logga in")');
    
    // Vänta på att bli omdirigerad eller se framgångsmeddelande
    await Promise.race([
      page.waitForURL('http://localhost:3002/', { timeout: 10000 }),
      page.waitForSelector('text=Inloggning lyckades!', { timeout: 10000 })
    ]);
    
    // Om vi är på startsidan, verifiera att vi är inloggade
    if (page.url() === 'http://localhost:3002/') {
      console.log('✅ Inloggning lyckades - omdirigerad till startsidan!');
    } else {
      console.log('✅ Inloggning lyckades!');
    }
  });
});

// Hjälptest för att rensa användaren om det behövs
test.describe('Rensa testdata', () => {
  test.skip('ta bort testanvändaren', async ({ request }) => {
    // Detta test är avstängt som standard (skip)
    // Ta bort .skip för att köra det
    const response = await request.delete('http://localhost:3002/api/delete-user');
    const data = await response.json();
    console.log('Användare borttagen:', data);
  });
});