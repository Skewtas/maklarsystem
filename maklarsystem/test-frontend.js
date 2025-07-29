const { test, expect } = require('@playwright/test');

test('Undersök frontend-problemet med seq', async ({ page }) => {
  console.log('=== PLAYWRIGHT TEST: Frontend Investigation ===');
  
  // Steg 1: Navigera till sidan
  console.log('1. Navigerar till http://localhost:3000');
  await page.goto('http://localhost:3000');
  
  // Steg 2: Vänta på full laddning
  console.log('2. Väntar på full laddning...');
  await page.waitForLoadState('networkidle');
  
  // Steg 3: Ta screenshot för visuell bekräftelse
  console.log('3. Tar screenshot...');
  await page.screenshot({ path: 'frontend-investigation.png', fullPage: true });
  
  // Steg 4-10: Systematisk undersökning med seq-liknande approach
  const checks = [
    { step: 4, desc: 'Kontrollera page title', selector: 'title', action: 'textContent' },
    { step: 5, desc: 'Kontrollera h1 elements', selector: 'h1', action: 'allTextContents' },
    { step: 6, desc: 'Kontrollera h2 elements', selector: 'h2', action: 'allTextContents' },
    { step: 7, desc: 'Kontrollera synlig text "Bergets Ro"', selector: 'text=Bergets Ro', action: 'count' },
    { step: 8, desc: 'Kontrollera synlig text "Mäklarsystem"', selector: 'text=Mäklarsystem', action: 'count' },
    { step: 9, desc: 'Kontrollera alla synliga headings', selector: 'h1, h2, h3, h4, h5, h6', action: 'allTextContents' },
    { step: 10, desc: 'Kontrollera URL efter redirect', selector: null, action: 'url' }
  ];
  
  for (const check of checks) {
    console.log(`${check.step}. ${check.desc}`);
    
    try {
      let result;
      
      switch (check.action) {
        case 'textContent':
          result = await page.locator(check.selector).first().textContent();
          break;
        case 'allTextContents':
          result = await page.locator(check.selector).allTextContents();
          break;
        case 'count':
          result = await page.locator(check.selector).count();
          break;
        case 'url':
          result = page.url();
          break;
      }
      
      console.log(`   ✅ Resultat: ${JSON.stringify(result)}`);
    } catch (error) {
      console.log(`   ❌ Fel: ${error.message}`);
    }
  }
  
  // Steg 11: Kontrollera alla element som innehåller "Bergets" eller "Mäklare"
  console.log('11. Söker efter alla element med "Bergets" eller "Mäklare"');
  
  const bergets = await page.locator(':has-text("Bergets")').allTextContents();
  const maklare = await page.locator(':has-text("Mäklare")').allTextContents();
  
  console.log(`   Bergets Ro förekomster: ${bergets.length} - ${JSON.stringify(bergets)}`);
  console.log(`   Mäklare förekomster: ${maklare.length} - ${JSON.stringify(maklare)}`);
  
  // Steg 12: Kontrollera alla dolda element
  console.log('12. Kontrollerar dolda element...');
  const hiddenElements = await page.locator('[hidden]').count();
  console.log(`   Antal dolda element: ${hiddenElements}`);
  
  // Steg 13: Body text innehåll
  console.log('13. Kontrollerar body textContent...');
  const bodyText = await page.locator('body').textContent();
  const containsBergets = bodyText.includes('Bergets Ro');
  const containsMaklare = bodyText.includes('Mäklarsystem');
  
  console.log(`   Body innehåller "Bergets Ro": ${containsBergets}`);
  console.log(`   Body innehåller "Mäklarsystem": ${containsMaklare}`);
  
  // Steg 14: Final assertion
  console.log('14. Final validering...');
  
  // Det synliga h2-elementet bör vara "Mäklarsystem"
  const visibleH2 = await page.locator('h2:visible').first().textContent();
  console.log(`   Synligt h2 element: "${visibleH2}"`);
  
  // Assertions
  expect(visibleH2).toBe('Mäklarsystem');
  expect(await page.locator('text=Bergets Ro').count()).toBe(0); // Ska inte finnas synligt
  
  console.log('=== TEST SLUTFÖRT ===');
}); 