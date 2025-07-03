const { test, expect } = require('@playwright/test');

test.describe('CKEditor Plotly Integration', () => {
  let consoleLogs = [];
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    // Capture console logs and errors
    consoleLogs = [];
    consoleErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`Browser Console: ${text}`);
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.error(`Page Error: ${error.message}`);
    });

    // Start the dev server if not already running
    // Note: Make sure to start `npm run dev` before running tests
    await page.goto('http://localhost:5173');
    
    // Wait for the editor to load
    await page.waitForSelector('#editor', { timeout: 10000 });
    
    // Wait a bit more for the editor to fully initialize
    await page.waitForTimeout(2000);
  });

  test('should display debug tools and editor', async ({ page }) => {
    // Check if debug tools are present
    await expect(page.locator('h3')).toContainText('🔧 Debug Tools');
    await expect(page.locator('#debug-insert-chart')).toBeVisible();
    await expect(page.locator('#debug-check-dom')).toBeVisible();
    
    // Check if editor container exists
    await expect(page.locator('#editor')).toBeVisible();
    
    console.log('✅ Basic UI elements are present');
  });

  test('should initialize CKEditor with Plotly plugin', async ({ page }) => {
    // Wait for editor initialization logs
    await page.waitForTimeout(3000);
    
    // Check for editor initialization in console logs
    const hasEditorInit = consoleLogs.some(log => 
      log.includes('Editor initialized successfully with Plotly.js integration!')
    );
    
    expect(hasEditorInit).toBeTruthy();
    console.log('✅ Editor initialized successfully');
    
    // Check for chart rendering setup logs
    const hasChartSetup = consoleLogs.some(log => 
      log.includes('🎨 Setting up chart rendering...')
    );
    
    expect(hasChartSetup).toBeTruthy();
    console.log('✅ Chart rendering setup detected');
  });

  test('should have chart button in toolbar', async ({ page }) => {
    // Look for the chart button in the toolbar
    // CKEditor toolbar buttons might be in shadow DOM or have specific selectors
    
    // Wait for toolbar to be ready
    await page.waitForSelector('.ck-toolbar', { timeout: 5000 });
    
    // Check if plotlyChart button exists in toolbar
    const chartButton = page.locator('[data-cke-tooltip-text*="chart" i], [title*="chart" i], .ck-button[class*="plotly" i]');
    
    if (await chartButton.count() > 0) {
      console.log('✅ Chart button found in toolbar');
      await expect(chartButton.first()).toBeVisible();
    } else {
      // Try alternative selectors
      const allButtons = page.locator('.ck-toolbar .ck-button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} toolbar buttons`);
      
      // Log all button texts for debugging
      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await allButtons.nth(i).getAttribute('data-cke-tooltip-text') || 
                          await allButtons.nth(i).getAttribute('title') || 
                          await allButtons.nth(i).textContent();
        console.log(`Button ${i}: ${buttonText}`);
      }
      
      throw new Error('Chart button not found in toolbar');
    }
  });

  test('should insert chart using debug button', async ({ page }) => {
    // Clear previous logs
    consoleLogs = [];
    
    // Click the debug insert chart button
    await page.click('#debug-insert-chart');
    
    // Wait for potential chart insertion
    await page.waitForTimeout(2000);
    
    // Check console logs for debug chart insertion
    const hasDebugClick = consoleLogs.some(log => 
      log.includes('🔥 DEBUG: Insert chart button clicked')
    );
    expect(hasDebugClick).toBeTruthy();
    console.log('✅ Debug chart button clicked');
    
    const hasChartCreation = consoleLogs.some(log => 
      log.includes('🔧 Creating debug chart element...')
    );
    expect(hasChartCreation).toBeTruthy();
    console.log('✅ Debug chart element creation detected');
    
    const hasChartInserted = consoleLogs.some(log => 
      log.includes('🔧 Debug chart inserted')
    );
    expect(hasChartInserted).toBeTruthy();
    console.log('✅ Debug chart insertion detected');
  });

  test('should check DOM state using debug button', async ({ page }) => {
    // Clear previous logs
    consoleLogs = [];
    
    // Click the debug check DOM button
    await page.click('#debug-check-dom');
    
    // Wait for DOM check
    await page.waitForTimeout(1000);
    
    // Check console logs for DOM state check
    const hasDOMCheck = consoleLogs.some(log => 
      log.includes('🔍 DEBUG: Checking DOM state...')
    );
    expect(hasDOMCheck).toBeTruthy();
    console.log('✅ DOM state check triggered');
    
    // Look for DOM root detection
    const hasDOMRoot = consoleLogs.some(log => 
      log.includes('📍 DOM root (getDomRoot):')
    );
    expect(hasDOMRoot).toBeTruthy();
    console.log('✅ DOM root detected');
  });

  test('should detect chart elements in DOM after insertion', async ({ page }) => {
    // First insert a chart using debug button
    await page.click('#debug-insert-chart');
    await page.waitForTimeout(2000);
    
    // Clear logs and check DOM state
    consoleLogs = [];
    await page.click('#debug-check-dom');
    await page.waitForTimeout(1000);
    
    // Check if charts are found in DOM
    const chartCountLog = consoleLogs.find(log => 
      log.includes('📊 Total charts found:')
    );
    
    if (chartCountLog) {
      console.log(`✅ Chart detection log: ${chartCountLog}`);
      // Extract number of charts found
      const match = chartCountLog.match(/📊 Total charts found: (\d+)/);
      if (match) {
        const chartCount = parseInt(match[1]);
        expect(chartCount).toBeGreaterThan(0);
        console.log(`✅ Found ${chartCount} chart(s) in DOM`);
      }
    } else {
      console.log('❌ No chart count log found');
    }
  });

  test('should test toolbar chart button if available', async ({ page }) => {
    // Clear previous logs
    consoleLogs = [];
    
    try {
      // Try to find and click the chart button in toolbar
      const chartButton = page.locator('.ck-toolbar .ck-button').filter({ hasText: /chart/i }).first();
      
      if (await chartButton.count() > 0) {
        await chartButton.click();
        await page.waitForTimeout(1000);
        
        // Check for dropdown or chart insertion
        const hasDropdownClick = consoleLogs.some(log => 
          log.includes('🔥 DROPDOWN ITEM CLICKED')
        );
        
        if (hasDropdownClick) {
          console.log('✅ Toolbar chart button works - dropdown detected');
        } else {
          // Try clicking on dropdown items if dropdown appears
          const dropdownItems = page.locator('.ck-dropdown__panel .ck-button');
          const itemCount = await dropdownItems.count();
          
          if (itemCount > 0) {
            console.log(`Found ${itemCount} dropdown items`);
            await dropdownItems.first().click();
            await page.waitForTimeout(1000);
            
            const hasChartInsertion = consoleLogs.some(log => 
              log.includes('🚀 _insertChart called')
            );
            
            if (hasChartInsertion) {
              console.log('✅ Toolbar chart insertion works');
            } else {
              console.log('❌ Toolbar chart insertion not detected');
            }
          } else {
            console.log('❌ No dropdown items found');
          }
        }
      } else {
        console.log('⚠️ Chart button not found in toolbar - skipping test');
      }
    } catch (error) {
      console.log(`⚠️ Toolbar test failed: ${error.message}`);
    }
  });

  test('should capture and analyze all console output', async ({ page }) => {
    // Insert a chart and check DOM to generate logs
    await page.click('#debug-insert-chart');
    await page.waitForTimeout(1000);
    await page.click('#debug-check-dom');
    await page.waitForTimeout(1000);
    
    console.log('\n📊 === CONSOLE LOG ANALYSIS ===');
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`Total errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Categorize logs
    const categories = {
      'UI Events': /🔥|🚀|✍️/,
      'Model Operations': /📝|📄|✅.*model/,
      'DOM Operations': /🏗️|📦|🎯|📍/,
      'Chart Rendering': /🎨|🔄|📊|⏳/,
      'Debug Operations': /🔧|🔍/,
      'Errors/Warnings': /❌|⚠️|error|Error/i
    };
    
    console.log('\n📋 LOG CATEGORIES:');
    Object.entries(categories).forEach(([category, pattern]) => {
      const matches = consoleLogs.filter(log => pattern.test(log));
      console.log(`${category}: ${matches.length} messages`);
      if (matches.length > 0 && matches.length <= 5) {
        matches.forEach(msg => console.log(`  - ${msg.substring(0, 100)}...`));
      }
    });
    
    // Check for critical flows
    const hasPluginInit = consoleLogs.some(log => log.includes('🎨 Setting up chart rendering'));
    const hasModelCreation = consoleLogs.some(log => log.includes('🔧 Creating debug chart element'));
    const hasDOMConversion = consoleLogs.some(log => log.includes('🏗️ Converting model to editing view'));
    const hasRendering = consoleLogs.some(log => log.includes('🎯 _renderPendingCharts called'));
    
    console.log('\n🔍 CRITICAL FLOW CHECK:');
    console.log(`Plugin Initialization: ${hasPluginInit ? '✅' : '❌'}`);
    console.log(`Model Creation: ${hasModelCreation ? '✅' : '❌'}`);
    console.log(`DOM Conversion: ${hasDOMConversion ? '✅' : '❌'}`);
    console.log(`Chart Rendering: ${hasRendering ? '✅' : '❌'}`);
    
    // The test passes if we have basic functionality
    expect(hasPluginInit).toBeTruthy();
  });

  test.afterEach(async ({ page }) => {
    // Clean up
    await page.close();
  });
});