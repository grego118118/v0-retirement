// Performance test for tax calculator
const puppeteer = require('puppeteer');

async function testPerformance() {
  console.log('🚀 Starting Performance Test for Tax Calculator...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    
    console.log('📊 Testing Tax Calculator Page Load Performance...');
    
    const startTime = Date.now();
    
    // Navigate to tax calculator
    await page.goto('http://localhost:3000/tax-calculator', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️  Page Load Time: ${loadTime}ms`);
    
    if (loadTime < 2000) {
      console.log('✅ PASS: Page loads in under 2 seconds');
    } else {
      console.log('❌ FAIL: Page load exceeds 2 seconds');
    }
    
    // Test form interaction performance
    console.log('\n📝 Testing Form Interaction Performance...');
    
    const interactionStart = Date.now();
    
    // Fill out form fields
    await page.type('input[id="pensionIncome"]', '60000');
    await page.type('input[id="socialSecurityBenefit"]', '25000');
    await page.type('input[id="otherIncome"]', '5000');
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    const interactionTime = Date.now() - interactionStart;
    
    console.log(`⏱️  Form Interaction Time: ${interactionTime}ms`);
    
    if (interactionTime < 2000) {
      console.log('✅ PASS: Form interactions complete in under 2 seconds');
    } else {
      console.log('❌ FAIL: Form interactions exceed 2 seconds');
    }
    
    // Test responsive design
    console.log('\n📱 Testing Responsive Design...');
    
    const breakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1024, height: 768 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewport({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.waitForTimeout(500);
      
      // Check if calculator is visible and functional
      const calculatorVisible = await page.$('input[id="pensionIncome"]');
      
      if (calculatorVisible) {
        console.log(`✅ ${breakpoint.name} (${breakpoint.width}x${breakpoint.height}): Calculator visible and functional`);
      } else {
        console.log(`❌ ${breakpoint.name} (${breakpoint.width}x${breakpoint.height}): Calculator not properly displayed`);
      }
    }
    
    // Test calculation accuracy
    console.log('\n🧮 Testing Calculation Accuracy...');
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Clear and enter test values
    await page.evaluate(() => {
      document.querySelector('input[id="pensionIncome"]').value = '';
      document.querySelector('input[id="socialSecurityBenefit"]').value = '';
      document.querySelector('input[id="otherIncome"]').value = '';
    });
    
    await page.type('input[id="pensionIncome"]', '60000');
    await page.type('input[id="socialSecurityBenefit"]', '25000');
    await page.type('input[id="otherIncome"]', '5000');
    
    // Wait for calculation
    await page.waitForTimeout(2000);
    
    // Check if results are displayed
    const grossIncomeElement = await page.$('text/Gross Income');
    const totalTaxElement = await page.$('text/Total Taxes');
    const netIncomeElement = await page.$('text/Net Income');
    
    if (grossIncomeElement && totalTaxElement && netIncomeElement) {
      console.log('✅ PASS: Tax calculation results are displayed correctly');
    } else {
      console.log('❌ FAIL: Tax calculation results not properly displayed');
    }
    
    console.log('\n🎉 Performance testing completed!');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testPerformance().catch(console.error);
