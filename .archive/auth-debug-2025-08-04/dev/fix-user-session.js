const { test } = require('@playwright/test');

test('Fixa användarsession automatiskt', async ({ page, context }) => {
  console.log('=== FIXAR ANVÄNDARSESSION ===');
  
  // Steg 1: Rensa alla cookies och session data
  console.log('1. Rensar alla cookies och session data...');
  await context.clearCookies();
  await context.clearPermissions();
  
  // Steg 2: Gå till sidan
  console.log('2. Navigerar till localhost:3000...');
  await page.goto('http://localhost:3000');
  
  // Steg 3: Rensa localStorage och sessionStorage
  console.log('3. Rensar browser storage...');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Steg 4: Logga ut via Supabase programmatiskt
  console.log('4. Loggar ut programmatiskt...');
  await page.evaluate(() => {
    // Rensa Supabase auth från localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  });
  
  // Steg 5: Reload sidan för att trigga logout
  console.log('5. Laddar om sidan...');
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Steg 6: Kontrollera att vi är på login-sidan
  console.log('6. Kontrollerar att logout fungerade...');
  const currentUrl = page.url();
  console.log(`   Nuvarande URL: ${currentUrl}`);
  
  if (currentUrl.includes('/login')) {
    console.log('   ✅ Logout lyckades - nu på login-sidan');
  } else {
    console.log('   ⚠️ Försöker forcera redirect till login...');
    await page.goto('http://localhost:3000/login');
  }
  
  // Steg 7: Vänta på login-formuläret
  console.log('7. Väntar på login-formulär...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Steg 8: Logga in som rätt testanvändare
  console.log('8. Loggar in som anna.andersson@maklarsystem.se...');
  
  // Fyll i email
  await page.fill('input[type="email"]', 'anna.andersson@maklarsystem.se');
  await page.fill('input[type="password"]', 'testpassword123');
  
  // Klicka på login-knappen
  await page.click('button[type="submit"]');
  
  // Vänta på redirect eller hantera fel
  console.log('9. Väntar på inloggning...');
  try {
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('   ✅ Inloggning lyckades');
  } catch (error) {
    console.log('   ⚠️ Inloggning misslyckades, kontrollerar vad som händer...');
    const currentUrl = page.url();
    const pageText = await page.textContent('body');
    console.log(`   URL: ${currentUrl}`);
    console.log(`   Innehåll: ${pageText.substring(0, 200)}...`);
  }
  
  // Steg 10: Ta screenshot av resultatet
  console.log('10. Tar screenshot av resultatet...');
  await page.screenshot({ path: 'efter-fix.png', fullPage: true });
  
  // Steg 11: Kontrollera användaridentitet
  console.log('11. Kontrollerar användaridentitet...');
  try {
    const userEmail = await page.locator('text=@').first().textContent();
    console.log(`   Inloggad som: ${userEmail}`);
    
    if (userEmail && userEmail.includes('maklarsystem.se')) {
      console.log('   ✅ LYCKAT! Rätt användare inloggad');
    } else {
      console.log('   ❌ Fortfarande fel användare');
    }
  } catch (error) {
    console.log('   ⚠️ Kunde inte hitta användarens email på sidan');
  }
  
  console.log('=== FIX SLUTFÖRD ===');
}); 