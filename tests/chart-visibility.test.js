const { test, expect } = require('@playwright/test');

test.describe('Chart Visibility Tests', () => {
  let consoleLogs = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`Browser: ${text}`);
    });
    
    page.on('pageerror', error => {
      console.error(`Page Error: ${error.message}`);
    });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000); // Wait for editor to load
  });

  test('should render external chart visibly', async ({ page }) => {
    console.log('🌍 Testing external chart visibility...');
    
    // Create external chart
    await page.click('#debug-create-external-chart');
    await page.waitForTimeout(2000);
    
    // Check if external chart is visible
    const externalChart = page.locator('#external-chart');
    await expect(externalChart).toBeVisible();
    
    // Check for Plotly elements in external chart
    const plotlyDiv = page.locator('#external-chart .js-plotly-plot');
    await expect(plotlyDiv).toBeVisible();
    
    const svgElement = page.locator('#external-chart svg');
    await expect(svgElement).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/external-chart.png',
      fullPage: true 
    });
    
    console.log('✅ External chart visibility test passed');
  });

  test('should render CKEditor chart and compare with external', async ({ page }) => {
    console.log('📝 Testing CKEditor chart visibility...');
    
    // First create external chart for reference
    await page.click('#debug-create-external-chart');
    await page.waitForTimeout(2000);
    
    // Then create CKEditor chart
    consoleLogs = []; // Clear logs
    await page.click('#debug-insert-chart');
    await page.waitForTimeout(3000);
    
    // Check DOM state
    await page.click('#debug-check-dom');
    await page.waitForTimeout(1000);
    
    // Compare HTML structures
    await page.click('#debug-compare-html');
    await page.waitForTimeout(1000);
    
    // Take screenshot for visual comparison
    await page.screenshot({ 
      path: 'test-results/ckeditor-vs-external-charts.png',
      fullPage: true 
    });
    
    // Check if CKEditor charts exist
    const ckeditorCharts = page.locator('.ck-content .plotly-chart');
    const chartCount = await ckeditorCharts.count();
    expect(chartCount).toBeGreaterThan(0);
    
    console.log(`Found ${chartCount} charts in CKEditor`);
    
    // Check if charts have proper dimensions
    for (let i = 0; i < chartCount; i++) {
      const chart = ckeditorCharts.nth(i);
      const boundingBox = await chart.boundingBox();
      
      if (boundingBox) {
        console.log(`Chart ${i + 1} dimensions:`, boundingBox);
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      } else {
        console.log(`Chart ${i + 1} has no bounding box - might be hidden`);
      }
    }
    
    // Check console logs for dimension information
    const dimensionLogs = consoleLogs.filter(log => log.includes('📏 Element dimensions'));
    console.log('Dimension logs found:', dimensionLogs.length);
    
    const visibilityLogs = consoleLogs.filter(log => log.includes('👁️ Chart visibility'));
    console.log('Visibility logs found:', visibilityLogs.length);
    
    const htmlLogs = consoleLogs.filter(log => log.includes('🏗️ Element HTML'));
    console.log('HTML logs found:', htmlLogs.length);
  });

  test('should detect visual differences between charts', async ({ page }) => {
    console.log('🔍 Testing visual differences...');
    
    // Create both charts
    await page.click('#debug-create-external-chart');
    await page.waitForTimeout(2000);
    
    await page.click('#debug-insert-chart');
    await page.waitForTimeout(3000);
    
    // Get screenshots of both chart areas
    const externalChart = page.locator('#external-chart');
    const externalScreenshot = await externalChart.screenshot({ path: 'test-results/external-chart-only.png' });
    
    const editorArea = page.locator('.ck-content');
    const editorScreenshot = await editorArea.screenshot({ path: 'test-results/ckeditor-area.png' });
    
    // Check if external chart has visual content
    const externalBox = await externalChart.boundingBox();
    expect(externalBox).toBeTruthy();
    expect(externalBox?.width).toBeGreaterThan(100);
    expect(externalBox?.height).toBeGreaterThan(100);
    
    console.log('External chart dimensions:', externalBox);
    
    // Check CKEditor chart dimensions
    const ckeditorChart = page.locator('.ck-content .plotly-chart').first();
    const ckeditorBox = await ckeditorChart.boundingBox();
    
    if (ckeditorBox) {
      console.log('CKEditor chart dimensions:', ckeditorBox);
      expect(ckeditorBox.width).toBeGreaterThan(100);
      expect(ckeditorBox.height).toBeGreaterThan(100);
    } else {
      console.log('❌ CKEditor chart has no visible dimensions');
    }
    
    // Compare HTML structures
    await page.click('#debug-compare-html');
    await page.waitForTimeout(1000);
    
    // Look for specific comparison results in console
    const comparisonLogs = consoleLogs.filter(log => log.includes('🔍 COMPARISON RESULTS'));
    expect(comparisonLogs.length).toBeGreaterThan(0);
    
    console.log('Comparison results found in logs');
  });

  test('should analyze CSS and styling issues', async ({ page }) => {
    console.log('🎨 Testing CSS and styling...');
    
    // Create CKEditor chart
    await page.click('#debug-insert-chart');
    await page.waitForTimeout(3000);
    
    // Get computed styles of chart elements
    const chartElement = page.locator('.ck-content .plotly-chart').first();
    
    if (await chartElement.count() > 0) {
      const styles = await chartElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          overflow: computed.overflow,
          width: computed.width,
          height: computed.height,
          position: computed.position,
          zIndex: computed.zIndex,
          transform: computed.transform
        };
      });
      
      console.log('Chart computed styles:', styles);
      
      // Check for problematic styles
      expect(styles.display).not.toBe('none');
      expect(styles.visibility).not.toBe('hidden');
      expect(parseFloat(styles.opacity)).toBeGreaterThan(0);
      expect(styles.width).not.toBe('0px');
      expect(styles.height).not.toBe('0px');
      
      // Check for Plotly-specific elements
      const plotlyElements = await chartElement.evaluate(el => {
        return {
          hasJsPlotlyPlot: el.querySelector('.js-plotly-plot') !== null,
          svgCount: el.querySelectorAll('svg').length,
          plotlyDivs: el.querySelectorAll('.js-plotly-plot').length
        };
      });
      
      console.log('Plotly elements analysis:', plotlyElements);
      
      // At minimum, should have Plotly plot class
      expect(plotlyElements.hasJsPlotlyPlot || plotlyElements.plotlyDivs > 0).toBeTruthy();
    } else {
      throw new Error('No chart element found for CSS analysis');
    }
  });

  test.afterEach(async ({ page }) => {
    // Clean up
    await page.close();
  });
});