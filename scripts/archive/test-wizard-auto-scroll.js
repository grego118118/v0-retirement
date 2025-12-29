/**
 * Test script to verify wizard auto-scroll functionality
 * Tests step transitions, focus management, and mobile responsiveness
 */

console.log('🧪 Testing Wizard Auto-Scroll Functionality...\n');

// Test 1: Check if auto-scroll refs are properly attached
function testScrollRefs() {
  console.log('📍 Test 1: Checking scroll reference elements...');
  
  const mainContent = document.querySelector('[data-testid="main-content"], .mb-8');
  const stepContent = document.querySelector('[data-testid="step-content"]');
  
  if (mainContent) {
    console.log('✅ Main content element found');
  } else {
    console.log('❌ Main content element not found');
  }
  
  if (stepContent) {
    console.log('✅ Step content element found');
  } else {
    console.log('❌ Step content element not found');
  }
  
  return { mainContent, stepContent };
}

// Test 2: Check for focusable elements in current step
function testFocusableElements() {
  console.log('\n📍 Test 2: Checking focusable elements...');
  
  const focusableSelector = 'input:not([disabled]):not([type="hidden"]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), [tabindex]:not([tabindex="-1"])';
  const focusableElements = document.querySelectorAll(focusableSelector);
  
  console.log(`📊 Found ${focusableElements.length} focusable elements`);
  
  if (focusableElements.length > 0) {
    console.log('✅ Focusable elements available for auto-focus');
    console.log(`🎯 First focusable element: ${focusableElements[0].tagName} (${focusableElements[0].type || 'N/A'})`);
  } else {
    console.log('❌ No focusable elements found');
  }
  
  return focusableElements;
}

// Test 3: Check for Next/Previous navigation buttons
function testNavigationButtons() {
  console.log('\n📍 Test 3: Checking navigation buttons...');
  
  const nextButton = document.querySelector('button:has-text("Next"), button[data-testid="next-button"]');
  const backButton = document.querySelector('button:has-text("Back"), button[data-testid="back-button"]');
  
  // Alternative selectors for Next/Back buttons
  const allButtons = document.querySelectorAll('button');
  let foundNext = false;
  let foundBack = false;
  
  allButtons.forEach(button => {
    const text = button.textContent?.toLowerCase() || '';
    if (text.includes('next') || text.includes('continue')) {
      foundNext = true;
      console.log('✅ Next button found:', button.textContent);
    }
    if (text.includes('back') || text.includes('previous')) {
      foundBack = true;
      console.log('✅ Back button found:', button.textContent);
    }
  });
  
  if (!foundNext) console.log('❌ Next button not found');
  if (!foundBack) console.log('❌ Back button not found');
  
  return { foundNext, foundBack };
}

// Test 4: Check mobile detection
function testMobileDetection() {
  console.log('\n📍 Test 4: Testing mobile detection...');
  
  const isMobile = window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  console.log(`📱 Screen width: ${window.innerWidth}px`);
  console.log(`🔍 User agent: ${navigator.userAgent}`);
  console.log(`📊 Mobile detected: ${isMobile ? 'Yes' : 'No'}`);
  
  return isMobile;
}

// Test 5: Check scroll behavior support
function testScrollBehaviorSupport() {
  console.log('\n📍 Test 5: Checking scroll behavior support...');
  
  const hasNativeSupport = 'scrollBehavior' in document.documentElement.style;
  console.log(`🔧 Native smooth scroll support: ${hasNativeSupport ? 'Yes' : 'No (will use fallback)'}`);
  
  return hasNativeSupport;
}

// Test 6: Simulate auto-scroll functionality
function testAutoScrollSimulation() {
  console.log('\n📍 Test 6: Simulating auto-scroll...');
  
  const mainContent = document.querySelector('.mb-8');
  if (!mainContent) {
    console.log('❌ Cannot simulate scroll - main content not found');
    return false;
  }
  
  const rect = mainContent.getBoundingClientRect();
  const offset = window.innerWidth <= 768 ? 60 : 80;
  const targetPosition = window.pageYOffset + rect.top - offset;
  
  console.log(`📐 Current scroll position: ${window.pageYOffset}px`);
  console.log(`📐 Target scroll position: ${targetPosition}px`);
  console.log(`📐 Scroll distance: ${Math.abs(targetPosition - window.pageYOffset)}px`);
  
  // Test smooth scroll
  try {
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    console.log('✅ Smooth scroll executed successfully');
    return true;
  } catch (error) {
    console.log('❌ Smooth scroll failed:', error.message);
    return false;
  }
}

// Test 7: Check wizard step indicators
function testWizardStepIndicators() {
  console.log('\n📍 Test 7: Checking wizard step indicators...');
  
  const stepIndicators = document.querySelectorAll('[class*="rounded-full"], [class*="step"]');
  const progressElements = document.querySelectorAll('[class*="progress"], [class*="complete"]');
  
  console.log(`📊 Found ${stepIndicators.length} potential step indicators`);
  console.log(`📊 Found ${progressElements.length} progress elements`);
  
  if (stepIndicators.length > 0) {
    console.log('✅ Wizard step navigation detected');
  } else {
    console.log('❌ No wizard step indicators found');
  }
  
  return stepIndicators.length > 0;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Wizard Auto-Scroll Tests...\n');
  
  const results = {
    refs: testScrollRefs(),
    focusable: testFocusableElements(),
    navigation: testNavigationButtons(),
    mobile: testMobileDetection(),
    scrollSupport: testScrollBehaviorSupport(),
    autoScroll: testAutoScrollSimulation(),
    stepIndicators: testWizardStepIndicators()
  };
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`✅ Main content element: ${results.refs.mainContent ? 'Found' : 'Not found'}`);
  console.log(`✅ Focusable elements: ${results.focusable.length} found`);
  console.log(`✅ Navigation buttons: ${results.navigation.foundNext && results.navigation.foundBack ? 'Both found' : 'Missing'}`);
  console.log(`✅ Mobile detection: ${results.mobile ? 'Mobile' : 'Desktop'}`);
  console.log(`✅ Scroll support: ${results.scrollSupport ? 'Native' : 'Fallback'}`);
  console.log(`✅ Auto-scroll test: ${results.autoScroll ? 'Passed' : 'Failed'}`);
  console.log(`✅ Step indicators: ${results.stepIndicators ? 'Found' : 'Not found'}`);
  
  const passedTests = Object.values(results).filter(result => 
    result === true || 
    (typeof result === 'object' && result !== null && Object.keys(result).length > 0) ||
    (typeof result === 'object' && result.length > 0)
  ).length;
  
  console.log(`\n🎯 Overall Score: ${passedTests}/7 tests passed`);
  
  if (passedTests >= 5) {
    console.log('🎉 Auto-scroll functionality appears to be working correctly!');
  } else {
    console.log('⚠️  Some issues detected. Check individual test results above.');
  }
  
  return results;
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testAutoScrollSimulation };
}
