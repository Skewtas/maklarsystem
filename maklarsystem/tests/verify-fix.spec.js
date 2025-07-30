const { test, expect } = require('@playwright/test');

test('Verifiera att vita sidan är fixad', async ({ page }) => {
  console.log('=== VERIFIERAR FIX AV VITA SIDAN ===');
  
  // Gå till startsidan
  await page.goto('http://localhost:3000');
  
  // Vänta på att sidan ska ladda
  await page.waitForLoadState('networkidle');
  
  // Ta en screenshot för verifiering
  await page.screenshot({ path: 'after-cookie-fix.png', fullPage: true });
  
  // Kontrollera att välkomstmeddelandet visas
  const welcomeText = await page.textContent('h1');
  console.log('H1 text:', welcomeText);
  
  // Kontrollera att sidan inte är vit (ska ha innehåll)
  const bodyContent = await page.textContent('body');
  const hasContent = bodyContent.includes('Välkommen till Mäklarsystemet');
  
  console.log('Har innehåll:', hasContent);
  console.log('Body innehåller "Välkommen":', bodyContent.includes('Välkommen'));
  
  // Verifiera att inga fel visas
  const errorElements = await page.locator('text=404').count();
  console.log('Antal 404-fel:', errorElements);
  
  expect(hasContent).toBe(true);
  expect(errorElements).toBe(0);
  
  console.log('✅ VITA SIDAN ÄR FIXAD!');
}); 