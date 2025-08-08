const { chromium } = require('playwright');

async function debugAuthDetailed() {
  console.log('🔍 Starting detailed auth debug session...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    recordVideo: { dir: 'videos/' }
  });
  
  const page = await context.newPage();
  
  const allRequests = [];
  const allResponses = [];
  
  // Capture ALL network traffic
  page.on('request', request => {
    allRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: new Date().toISOString()
    });
    
    console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
    if (request.postData()) {
      console.log(`   📝 Body: ${request.postData()}`);
    }
  });
  
  page.on('response', async response => {
    let responseBody = null;
    try {
      // Try to get response body
      responseBody = await response.text();
    } catch (e) {
      responseBody = `Error reading response: ${e.message}`;
    }
    
    const responseData = {
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body: responseBody,
      timestamp: new Date().toISOString()
    };
    
    allResponses.push(responseData);
    
    console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    if (response.status() >= 400) {
      console.log(`   ❌ Error: ${response.statusText()}`);
      console.log(`   📄 Body: ${responseBody.substring(0, 500)}...`);
    }
    
    // Log Supabase specific responses in detail
    if (response.url().includes('supabase') || response.url().includes('auth')) {
      console.log(`🔑 SUPABASE/AUTH RESPONSE:`, {
        status: response.status(),
        url: response.url(),
        body: responseBody.substring(0, 1000)
      });
    }
  });
  
  try {
    console.log('🌐 Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    console.log('📝 Filling login form...');
    await page.fill('input[type="email"], input[name="email"], #email', 'rani.shakir@hotmail.com');
    await page.fill('input[type="password"], input[name="password"], #password', 'Test123!');
    
    // Get page content before submit to understand form structure
    const formHTML = await page.locator('form').innerHTML();
    console.log('📋 Form HTML:', formHTML);
    
    console.log('🔘 Submitting form...');
    
    // Try to capture the exact form submission
    const submitPromise = page.waitForResponse(response => {
      return response.url().includes('/login') || 
             response.url().includes('/auth') || 
             response.url().includes('supabase');
    }, { timeout: 10000 });
    
    // Click submit button
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), .login-button, #login-button');
    
    try {
      const authResponse = await submitPromise;
      console.log('🎯 Captured auth response:', {
        url: authResponse.url(),
        status: authResponse.status(),
        statusText: authResponse.statusText()
      });
    } catch (e) {
      console.log('⚠️ No auth response captured within timeout');
    }
    
    // Wait for any redirects or additional requests
    await page.waitForTimeout(5000);
    
    // Get final URL and any error messages
    const finalUrl = page.url();
    console.log('🌍 Final URL:', finalUrl);
    
    // Try to extract any error messages from the page
    const errorMessages = await page.$$eval('[class*="error"], .alert, .notification, [role="alert"]', 
      elements => elements.map(el => el.textContent));
    
    if (errorMessages.length > 0) {
      console.log('🚨 Error messages found on page:', errorMessages);
    }
    
    // Get the page content to look for error messages
    const pageContent = await page.textContent('body');
    if (pageContent.includes('error') || pageContent.includes('Error')) {
      console.log('⚠️ Page contains error text');
      // Extract relevant error text
      const lines = pageContent.split('\n').filter(line => 
        line.toLowerCase().includes('error') && line.trim().length > 0);
      console.log('📝 Error-related text:', lines);
    }
    
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }
  
  // Analyze all captured data
  console.log('\n📊 ANALYSIS:');
  console.log(`Total requests: ${allRequests.length}`);
  console.log(`Total responses: ${allResponses.length}`);
  
  // Filter for auth-related traffic
  const authTraffic = allResponses.filter(r => 
    r.url.includes('auth') ||
    r.url.includes('login') ||
    r.url.includes('supabase') ||
    r.url.includes('/api/') ||
    r.status >= 300
  );
  
  console.log('\n🔐 AUTH-RELATED TRAFFIC:');
  authTraffic.forEach(response => {
    console.log(`  ${response.status} ${response.method || 'GET'} ${response.url}`);
    if (response.status >= 400 || response.body.includes('error')) {
      console.log(`    📄 Response: ${response.body.substring(0, 300)}...`);
    }
  });
  
  // Save comprehensive data
  const debugData = {
    timestamp: new Date().toISOString(),
    finalUrl: page.url(),
    requests: allRequests,
    responses: allResponses,
    authTraffic: authTraffic,
    summary: {
      totalRequests: allRequests.length,
      totalResponses: allResponses.length,
      authRequests: authTraffic.length,
      errorResponses: allResponses.filter(r => r.status >= 400).length
    }
  };
  
  require('fs').writeFileSync('auth-debug-comprehensive.json', JSON.stringify(debugData, null, 2));
  console.log('\n💾 Comprehensive debug data saved to: auth-debug-comprehensive.json');
  
  // Take final screenshot
  await page.screenshot({ path: 'auth-debug-final.png', fullPage: true });
  console.log('📸 Final screenshot saved: auth-debug-final.png');
  
  await browser.close();
}

debugAuthDetailed().catch(console.error);