const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting toolbar functionality test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] 
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    // Filter out some noisy logs but keep our important ones
    if (text.includes('🔥') || text.includes('🚀') || text.includes('📋') || text.includes('❌') || text.includes('✅')) {
      console.log(`[${type.toUpperCase()}] ${text}`);
    }
  });
  
  try {
    console.log('🌐 Loading page...');
    await page.goto('file:///Users/ondrejch/projects/plotty-ckeditor/dist/index.html', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for editor to be ready...');
    await page.waitForSelector('.ck-editor', { timeout: 10000 });
    await page.waitForTimeout(3000); // Give editor time to fully initialize
    
    console.log('🔍 Looking for toolbar dropdown button...');
    
    // Find the dropdown button by its icon or label
    const dropdownButton = await page.$('.ck-button[aria-label*="Insert Chart"], .ck-button[title*="Insert Chart"]');
    
    if (!dropdownButton) {
      console.log('❌ Dropdown button not found. Available buttons:');
      const buttons = await page.$$('.ck-button');
      for (let i = 0; i < buttons.length; i++) {
        const label = await buttons[i].evaluate(el => el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent.trim());
        console.log(`  - Button ${i}: "${label}"`);
      }
      await browser.close();
      return;
    }
    
    console.log('✅ Found dropdown button, clicking...');
    await dropdownButton.click();
    
    console.log('⏳ Waiting for dropdown panel...');
    await page.waitForTimeout(1000);
    
    // Check if dropdown panel appeared
    const dropdownPanel = await page.$('.ck-dropdown__panel');
    if (!dropdownPanel) {
      console.log('❌ Dropdown panel did not appear');
      await browser.close();
      return;
    }
    
    console.log('✅ Dropdown panel found');
    
    // Find dropdown items
    const dropdownItems = await page.$$('.ck-dropdown__panel .ck-button');
    console.log(`📋 Found ${dropdownItems.length} dropdown items`);
    
    if (dropdownItems.length === 0) {
      console.log('❌ No dropdown items found');
      await browser.close();
      return;
    }
    
    // Test clicking the first item (Scatter Plot)
    console.log('🎯 Testing first dropdown item click...');
    await dropdownItems[0].click();
    
    console.log('⏳ Waiting for command execution...');
    await page.waitForTimeout(2000);
    
    // Check if a chart was inserted by looking for plotly-chart elements
    const chartElements = await page.$$('.plotly-chart');
    console.log(`📊 Found ${chartElements.length} chart elements in editor`);
    
    if (chartElements.length > 0) {
      console.log('✅ SUCCESS: Chart was inserted via dropdown!');
      
      // Test external debug button for comparison
      console.log('🔧 Testing external debug button for comparison...');
      const debugButton = await page.$('#debug-insert-chart');
      if (debugButton) {
        await debugButton.click();
        await page.waitForTimeout(2000);
        
        const newChartCount = await page.$$eval('.plotly-chart', charts => charts.length);
        console.log(`📊 Chart count after debug button: ${newChartCount}`);
      }
      
    } else {
      console.log('❌ FAILURE: No chart was inserted via dropdown');
    }
    
    console.log('🏁 Test completed');
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser left open for manual inspection. Close it manually when done.');
  // await browser.close();
})();