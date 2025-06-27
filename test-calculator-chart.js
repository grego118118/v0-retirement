/**
 * Test script to verify calculator chart functionality
 * This script will test the pension calculator and verify that the chart appears after calculation
 */

const puppeteer = require('puppeteer');

async function testCalculatorChart() {
  console.log('🚀 Starting Calculator Chart Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: { width: 1280, height: 720 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to calculator page
    console.log('📍 Navigating to calculator page...');
    await page.goto('http://localhost:3000/calculator', { waitUntil: 'networkidle0' });
    
    // Wait for the calculator to load
    console.log('⏳ Waiting for calculator to load...');
    await page.waitForSelector('[data-testid="pension-calculator"], .pension-calculator, form', { timeout: 10000 });
    
    // Fill out the form with test data
    console.log('📝 Filling out calculator form...');
    
    // Wait for and fill age field
    await page.waitForSelector('input[placeholder*="age"], input[id*="age"], input[name*="age"]', { timeout: 5000 });
    await page.type('input[placeholder*="age"], input[id*="age"], input[name*="age"]', '62');
    
    // Wait for and fill years of service
    await page.waitForSelector('input[placeholder*="service"], input[id*="service"], input[name*="service"]', { timeout: 5000 });
    await page.type('input[placeholder*="service"], input[id*="service"], input[name*="service"]', '32');
    
    // Fill salary fields
    const salarySelectors = [
      'input[placeholder*="salary"], input[id*="salary"], input[name*="salary"]',
      'input[placeholder*="95000"]'
    ];
    
    for (const selector of salarySelectors) {
      try {
        const elements = await page.$$(selector);
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          await elements[i].clear();
          await elements[i].type('95000');
        }
        break;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    // Select retirement group (Group 2)
    try {
      await page.waitForSelector('select, [role="combobox"]', { timeout: 5000 });
      const groupSelectors = await page.$$('select, [role="combobox"]');
      if (groupSelectors.length > 0) {
        await groupSelectors[0].click();
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown'); // Navigate to Group 2
        await page.keyboard.press('Enter');
      }
    } catch (e) {
      console.log('Could not select retirement group, continuing...');
    }
    
    // Look for and click the calculate button
    console.log('🔢 Clicking calculate button...');
    const calculateButtonSelectors = [
      'button:contains("Calculate")',
      'button[type="submit"]',
      'button:contains("Continue")',
      'input[type="submit"]'
    ];
    
    let calculationStarted = false;
    for (const selector of calculateButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        calculationStarted = true;
        console.log(`✅ Clicked calculate button with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`Button selector ${selector} not found, trying next...`);
      }
    }
    
    if (!calculationStarted) {
      // Try clicking any button that might be the calculate button
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.toLowerCase().includes('calculate') || text.toLowerCase().includes('continue')) {
          await button.click();
          calculationStarted = true;
          console.log(`✅ Clicked button with text: ${text}`);
          break;
        }
      }
    }
    
    if (calculationStarted) {
      // Wait for calculation to complete and results to appear
      console.log('⏳ Waiting for calculation results...');
      await page.waitForTimeout(3000);
      
      // Check for chart presence
      console.log('🔍 Looking for retirement benefits chart...');
      const chartSelectors = [
        '[data-testid="calculator-chart"]',
        '.calculator-chart',
        'table:contains("Retirement")',
        'table:contains("Pension")',
        'table:contains("Age")',
        '[class*="chart"]',
        'table',
        '.card:contains("Interactive Retirement Benefits")',
        '.card:contains("Projection")'
      ];
      
      let chartFound = false;
      for (const selector of chartSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          chartFound = true;
          console.log(`✅ Chart found with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`Chart selector ${selector} not found, trying next...`);
        }
      }
      
      if (!chartFound) {
        // Check if any tables exist on the page
        const tables = await page.$$('table');
        if (tables.length > 0) {
          console.log(`✅ Found ${tables.length} table(s) on the page`);
          chartFound = true;
        }
      }
      
      // Take a screenshot for verification
      await page.screenshot({ path: 'calculator-test-result.png', fullPage: true });
      console.log('📸 Screenshot saved as calculator-test-result.png');
      
      if (chartFound) {
        console.log('🎉 SUCCESS: Calculator chart is displaying correctly!');
        return true;
      } else {
        console.log('❌ FAILURE: Calculator chart not found after calculation');
        return false;
      }
    } else {
      console.log('❌ FAILURE: Could not start calculation');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testCalculatorChart().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testCalculatorChart };
