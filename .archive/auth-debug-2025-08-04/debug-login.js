const { chromium } = require('playwright');

async function debugLogin() {
  console.log('🚀 Starting login debug session...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  
  const context = await browser.newContext({
    // Capture console logs
    recordVideo: { dir: 'videos/' }
  });
  
  const page = await context.newPage();
  
  // Array to store all logs and errors
  const logs = [];
  const errors = [];
  const networkResponses = [];
  
  // Capture console messages
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    logs.push(logEntry);
    console.log(`📝 Console [${msg.type().toUpperCase()}]: ${msg.text()}`);
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    errors.push(errorEntry);
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  // Capture network responses
  page.on('response', response => {
    const responseEntry = {
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    };
    networkResponses.push(responseEntry);
    
    // Log auth-related requests
    if (response.url().includes('auth') || response.url().includes('login') || response.url().includes('supabase')) {
      console.log(`🌐 Auth Request: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🔗 Navigating to http://localhost:3000/login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: 'login-page-initial.png', fullPage: true });
    console.log('📸 Initial screenshot saved: login-page-initial.png');
    
    // Fill in the login form
    console.log('📝 Filling in email field...');
    await page.fill('input[type="email"], input[name="email"], #email', 'rani.shakir@hotmail.com');
    
    console.log('📝 Filling in password field...');
    await page.fill('input[type="password"], input[name="password"], #password', 'Test123!');
    
    // Take screenshot before clicking login
    await page.screenshot({ path: 'login-form-filled.png', fullPage: true });
    console.log('📸 Form filled screenshot saved: login-form-filled.png');
    
    // Click login button
    console.log('🔘 Clicking login button...');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), .login-button, #login-button');
    
    // Wait a bit for the response
    console.log('⏳ Waiting for auth response...');
    await page.waitForTimeout(3000);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'login-after-attempt.png', fullPage: true });
    console.log('📸 Post-login screenshot saved: login-after-attempt.png');
    
    // Wait for any additional network activity
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log(`💥 Error during login flow: ${error.message}`);
    await page.screenshot({ path: 'login-error-state.png', fullPage: true });
  }
  
  // Extract and log specific auth responses
  console.log('\n🔍 AUTH-RELATED NETWORK RESPONSES:');
  const authResponses = networkResponses.filter(r => 
    r.url.includes('auth') || 
    r.url.includes('login') || 
    r.url.includes('supabase') ||
    r.url.includes('api')
  );
  
  for (const response of authResponses) {
    console.log(`  ${response.status} ${response.url}`);
    if (response.status >= 400) {
      console.log(`    ❌ Error Response: ${response.statusText}`);
    }
  }
  
  // Log console errors
  if (errors.length > 0) {
    console.log('\n🚨 PAGE ERRORS:');
    errors.forEach(error => {
      console.log(`  ${error.timestamp}: ${error.message}`);
      if (error.stack) {
        console.log(`    Stack: ${error.stack.split('\n')[0]}`);
      }
    });
  }
  
  // Log important console messages
  const importantLogs = logs.filter(log => 
    log.type === 'error' || 
    log.text.includes('auth') || 
    log.text.includes('error') ||
    log.text.includes('fail')
  );
  
  if (importantLogs.length > 0) {
    console.log('\n📋 IMPORTANT CONSOLE LOGS:');
    importantLogs.forEach(log => {
      console.log(`  [${log.type.toUpperCase()}] ${log.timestamp}: ${log.text}`);
    });
  }
  
  // Save detailed logs to file
  const debugData = {
    timestamp: new Date().toISOString(),
    consoleMessages: logs,
    pageErrors: errors,
    networkResponses: authResponses,
    summary: {
      totalConsoleMessages: logs.length,
      totalErrors: errors.length,
      authRequests: authResponses.length,
      errorResponses: authResponses.filter(r => r.status >= 400).length
    }
  };
  
  require('fs').writeFileSync('login-debug-data.json', JSON.stringify(debugData, null, 2));
  console.log('\n💾 Detailed debug data saved to: login-debug-data.json');
  
  console.log('\n✅ Debug session complete. Check the screenshots and debug data for details.');
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser will stay open for manual inspection. Press Ctrl+C to close.');
  await page.waitForTimeout(30000); // Wait 30 seconds before auto-closing
  
  await browser.close();
}

debugLogin().catch(console.error);