const { chromium } = require('playwright');

async function finalTest() {
  console.log('🎯 FINAL TEST: Using existing user anna.andersson@maklarsystem.se');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  // Capture all console logs and network requests
  page.on('console', msg => console.log(`📱 ${msg.type()}: ${msg.text()}`));
  page.on('response', response => {
    if (response.url().includes('supabase') || response.status() >= 300) {
      console.log(`🌐 ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    await page.goto('http://localhost:3000/login');
    
    // Try with the working user from our database check
    console.log('📝 Testing with anna.andersson@maklarsystem.se...');
    await page.fill('input[name="email"]', 'anna.andersson@maklarsystem.se');
    await page.fill('input[name="password"]', 'password123'); // Common password
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    console.log('🌍 Final URL:', finalUrl);
    
    if (finalUrl.includes('message=')) {
      const message = new URL(finalUrl).searchParams.get('message');
      console.log('📄 Error message:', decodeURIComponent(message));
    }
    
    // Try another common password
    if (finalUrl.includes('error') || finalUrl.includes('message=')) {
      console.log('📝 Trying with admin123...');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const finalUrl2 = page.url();
      console.log('🌍 Final URL 2:', finalUrl2);
      
      if (!finalUrl2.includes('message=') && !finalUrl2.includes('/login')) {
        console.log('✅ SUCCESS! Login worked with admin123');
      }
    }
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
  
  await page.screenshot({ path: 'final-test-result.png', fullPage: true });
  console.log('📸 Screenshot saved: final-test-result.png');
  
  await browser.close();
}

finalTest();