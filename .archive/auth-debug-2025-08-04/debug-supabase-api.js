const { chromium } = require('playwright');

async function debugSupabaseApi() {
  console.log('🔍 Starting Supabase API debug session...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const supabaseRequests = [];
  const supabaseResponses = [];
  
  // Intercept ALL requests and responses
  page.on('request', request => {
    // Log all Supabase related requests
    if (request.url().includes('supabase.co') || request.url().includes('auth')) {
      console.log(`🚀 SUPABASE REQUEST:`, {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData()
      });
      
      supabaseRequests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('supabase.co') || response.url().includes('auth')) {
      let responseBody = null;
      try {
        responseBody = await response.text();
      } catch (e) {
        responseBody = `Error reading response: ${e.message}`;
      }
      
      console.log(`📥 SUPABASE RESPONSE:`, {
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        headers: response.headers(),
        body: responseBody
      });
      
      supabaseResponses.push({
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        headers: response.headers(),
        body: responseBody,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Log all console messages
  page.on('console', msg => {
    console.log(`💬 Console [${msg.type().toUpperCase()}]: ${msg.text()}`);
  });
  
  // Log page errors
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });
  
  try {
    console.log('🌐 Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    console.log('📝 Filling in login credentials...');
    await page.fill('input[name="email"]', 'rani.shakir@hotmail.com');
    await page.fill('input[name="password"]', 'Test123!');
    
    console.log('🔘 Clicking login button...');
    
    // Click login and wait for any Supabase calls
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('supabase.co') || 
        response.url().includes('/login') ||
        response.status() >= 300, 
        { timeout: 10000 }
      ).catch(() => null),
      page.click('button[type="submit"]')
    ]);
    
    if (response) {
      console.log('🎯 Captured response:', {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
    
    // Wait for any additional requests
    await page.waitForTimeout(5000);
    
    // Get final page state
    const finalUrl = page.url();
    const pageText = await page.textContent('body');
    
    console.log('🌍 Final URL:', finalUrl);
    
    // Look for specific error messages
    const errorPatterns = [
      'Invalid login credentials',
      'Email not confirmed',
      'User not found',
      'Invalid password',
      'An error occurred during login',
      'Supabase',
      'Auth'
    ];
    
    console.log('🔍 Checking for error messages...');
    errorPatterns.forEach(pattern => {
      if (pageText.includes(pattern)) {
        console.log(`⚠️  Found error pattern: "${pattern}"`);
      }
    });
    
    // Extract error from URL if present
    const urlParams = new URL(finalUrl).searchParams;
    const messageParam = urlParams.get('message');
    if (messageParam) {
      console.log(`📄 URL Error Message: "${decodeURIComponent(messageParam)}"`);
    }
    
  } catch (error) {
    console.log(`💥 Test Error: ${error.message}`);
  }
  
  // Summary
  console.log('\n📊 SUPABASE API SUMMARY:');
  console.log(`- Total Supabase requests: ${supabaseRequests.length}`);
  console.log(`- Total Supabase responses: ${supabaseResponses.length}`);
  
  if (supabaseRequests.length === 0) {
    console.log('⚠️  NO SUPABASE REQUESTS DETECTED - This suggests the form submission is failing before reaching Supabase');
  }
  
  supabaseResponses.forEach((response, index) => {
    console.log(`\n📋 Response ${index + 1}:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   URL: ${response.url}`);
    console.log(`   Body: ${response.body.substring(0, 500)}...`);
  });
  
  // Save comprehensive data
  const debugData = {
    timestamp: new Date().toISOString(),
    finalUrl: page.url(),
    supabaseRequests,
    supabaseResponses,
    summary: {
      supabaseRequestCount: supabaseRequests.length,
      supabaseResponseCount: supabaseResponses.length,
      hasErrors: supabaseResponses.some(r => r.status >= 400)
    }
  };
  
  require('fs').writeFileSync('supabase-api-debug.json', JSON.stringify(debugData, null, 2));
  console.log('\n💾 Supabase API debug data saved to: supabase-api-debug.json');
  
  // Take final screenshot
  await page.screenshot({ path: 'supabase-debug-final.png', fullPage: true });
  console.log('📸 Final screenshot saved: supabase-debug-final.png');
  
  await browser.close();
}

debugSupabaseApi().catch(console.error);