// Quick test script to check toolbar
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting quick toolbar test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`Browser: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('📍 Navigating to localhost:5173...');
    await page.goto('http://localhost:5173');
    
    console.log('⏳ Waiting for editor to load...');
    await page.waitForTimeout(5000);
    
    // Check if toolbar exists
    const toolbar = await page.locator('.ck-toolbar').count();
    console.log(`📊 Found ${toolbar} toolbar(s)`);
    
    if (toolbar > 0) {
      // Count all toolbar buttons
      const buttons = await page.locator('.ck-toolbar .ck-button').count();
      console.log(`🔘 Found ${buttons} toolbar buttons`);
      
      // Try to find chart button specifically
      const chartButtons = await page.locator('.ck-toolbar .ck-button').all();
      console.log('🔍 Checking toolbar buttons...');
      
      for (let i = 0; i < chartButtons.length; i++) {
        const button = chartButtons[i];
        const tooltip = await button.getAttribute('data-cke-tooltip-text') || '';
        const title = await button.getAttribute('title') || '';
        const ariaLabel = await button.getAttribute('aria-label') || '';
        
        console.log(`Button ${i+1}: tooltip="${tooltip}", title="${title}", aria="${ariaLabel}"`);
        
        if (tooltip.toLowerCase().includes('chart') || 
            title.toLowerCase().includes('chart') ||
            ariaLabel.toLowerCase().includes('chart')) {
          console.log('✅ FOUND CHART BUTTON!');
          
          // Try clicking it
          await button.click();
          await page.waitForTimeout(1000);
          
          // Check if dropdown appeared
          const dropdown = await page.locator('.ck-dropdown__panel').count();
          console.log(`📋 Dropdown panels: ${dropdown}`);
          
          if (dropdown > 0) {
            const dropdownItems = await page.locator('.ck-dropdown__panel .ck-button').count();
            console.log(`📋 Dropdown items: ${dropdownItems}`);
            
            if (dropdownItems > 0) {
              console.log('🎯 Trying to click first dropdown item...');
              await page.locator('.ck-dropdown__panel .ck-button').first().click();
              await page.waitForTimeout(2000);
            }
          }
          break;
        }
      }
    }
    
    // Test debug buttons
    console.log('🔧 Testing debug button...');
    await page.click('#debug-insert-chart');
    await page.waitForTimeout(2000);
    
    await page.click('#debug-check-dom');
    await page.waitForTimeout(1000);
    
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  await page.waitForTimeout(5000); // Keep browser open for 5 seconds
  await browser.close();
})();