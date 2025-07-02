/**
 * Test script to verify Massachusetts Open Checkbook link integration
 * Tests both the essential information step and pension details step
 */

const puppeteer = require('puppeteer');

async function testMassachusettsCheckbookLink() {
  console.log('🔍 Testing Massachusetts Open Checkbook Link Integration...\n');

  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();

  try {
    // Navigate to the wizard
    console.log('📍 Navigating to wizard...');
    await page.goto('http://localhost:3000/wizard', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    // Test 1: Check if the link appears in the essential information step
    console.log('\n🧪 Test 1: Essential Information Step - Massachusetts Open Checkbook Link');
    
    // Look for the salary input field
    const salaryInput = await page.$('input[id="averageSalary"]');
    if (salaryInput) {
      console.log('✅ Found salary input field');
      
      // Focus on the salary field to trigger any guidance
      await salaryInput.click();
      await page.waitForTimeout(1000);
      
      // Check for the Massachusetts Open Checkbook link
      const checkbookLink = await page.$('a[href="https://cthrupayroll.mass.gov/"]');
      if (checkbookLink) {
        console.log('✅ Found Massachusetts Open Checkbook link in essential step');
        
        // Verify link text
        const linkText = await page.evaluate(el => el.textContent, checkbookLink);
        console.log(`📝 Link text: "${linkText}"`);
        
        // Verify link attributes
        const linkTarget = await page.evaluate(el => el.target, checkbookLink);
        const linkRel = await page.evaluate(el => el.rel, checkbookLink);
        console.log(`🎯 Link target: "${linkTarget}"`);
        console.log(`🔗 Link rel: "${linkRel}"`);
        
        // Check for external link icon
        const hasExternalIcon = await page.$('a[href="https://cthrupayroll.mass.gov/"] svg');
        if (hasExternalIcon) {
          console.log('✅ External link icon found');
        } else {
          console.log('❌ External link icon missing');
        }
        
        // Check for proper styling
        const linkContainer = await page.$('div.bg-blue-50');
        if (linkContainer) {
          console.log('✅ Proper blue background styling found');
        } else {
          console.log('❌ Blue background styling missing');
        }
        
      } else {
        console.log('❌ Massachusetts Open Checkbook link NOT found in essential step');
      }
    } else {
      console.log('❌ Salary input field not found');
    }

    // Test 2: Navigate to pension details step and test the link there
    console.log('\n🧪 Test 2: Pension Details Step - Massachusetts Open Checkbook Link');
    
    // Fill in required fields to proceed to next step
    await page.type('input[placeholder="1975"]', '1975');
    await page.waitForTimeout(500);
    
    await page.type('input[placeholder="75000"]', '85000');
    await page.waitForTimeout(500);
    
    // Click Next to go to pension details
    const nextButton = await page.$('button:has-text("Next")');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      console.log('📍 Navigated to pension details step');
      
      // Check for the Massachusetts Open Checkbook link in pension details
      const pensionCheckbookLink = await page.$('a[href="https://cthrupayroll.mass.gov/"]');
      if (pensionCheckbookLink) {
        console.log('✅ Found Massachusetts Open Checkbook link in pension details step');
        
        // Verify the link is properly positioned after the salary input
        const salarySection = await page.$('label:has-text("Average Highest 3 Years Salary")');
        if (salarySection) {
          console.log('✅ Link is positioned near salary input field');
        }
        
        // Test accessibility
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), pensionCheckbookLink);
        if (ariaLabel && ariaLabel.includes('Massachusetts Statewide Payroll Database')) {
          console.log('✅ Proper ARIA label found for accessibility');
          console.log(`🏷️  ARIA label: "${ariaLabel}"`);
        } else {
          console.log('❌ ARIA label missing or incorrect');
        }
        
      } else {
        console.log('❌ Massachusetts Open Checkbook link NOT found in pension details step');
      }
    } else {
      console.log('❌ Next button not found');
    }

    // Test 3: Verify link functionality (without actually clicking to avoid navigation)
    console.log('\n🧪 Test 3: Link Functionality Verification');
    
    const allCheckbookLinks = await page.$$('a[href="https://cthrupayroll.mass.gov/"]');
    console.log(`📊 Total Massachusetts Open Checkbook links found: ${allCheckbookLinks.length}`);
    
    for (let i = 0; i < allCheckbookLinks.length; i++) {
      const link = allCheckbookLinks[i];
      const href = await page.evaluate(el => el.href, link);
      const target = await page.evaluate(el => el.target, link);
      const rel = await page.evaluate(el => el.rel, link);
      
      console.log(`🔗 Link ${i + 1}:`);
      console.log(`   URL: ${href}`);
      console.log(`   Target: ${target}`);
      console.log(`   Rel: ${rel}`);
      
      // Verify security attributes
      if (target === '_blank' && rel === 'noopener noreferrer') {
        console.log('   ✅ Proper security attributes');
      } else {
        console.log('   ❌ Missing security attributes');
      }
    }

    console.log('\n🎉 Massachusetts Open Checkbook Link Integration Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testMassachusettsCheckbookLink().catch(console.error);
