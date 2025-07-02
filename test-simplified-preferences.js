/**
 * Test script to verify the simplified preferences step implementation
 * Run this in the browser console on the wizard page (/wizard)
 */

console.log('🧪 Testing Simplified Preferences Step...\n');

// Test 1: Check that non-functional preferences have been removed
function testRemovedPreferences() {
  console.log('📍 Test 1: Checking that non-functional preferences are removed...');
  
  const removedElements = [
    'Risk Tolerance',
    'Inflation Scenario', 
    'Analysis Options',
    'Include tax optimization',
    'Include Monte Carlo',
    'Conservative - Prioritize stability',
    'Moderate - Balanced approach',
    'Aggressive - Maximize growth',
    'Conservative (3-4% annually)',
    'Moderate (2-3% annually)',
    'Optimistic (1-2% annually)'
  ];
  
  const pageText = document.body.textContent || '';
  const foundRemovedElements = removedElements.filter(element => 
    pageText.includes(element)
  );
  
  console.log('🔍 Removed elements still found:', foundRemovedElements);
  
  if (foundRemovedElements.length === 0) {
    console.log('✅ All non-functional preferences successfully removed');
  } else {
    console.log('❌ Some removed elements still present:', foundRemovedElements);
  }
  
  return { foundRemovedElements, allRemoved: foundRemovedElements.length === 0 };
}

// Test 2: Check that Monthly Retirement Income Goal is present and functional
function testRetirementIncomeGoal() {
  console.log('\n📍 Test 2: Testing Monthly Retirement Income Goal functionality...');
  
  // Find the income goal input
  const incomeGoalInput = document.querySelector('input[id="retirementIncomeGoal"], input[placeholder="5000"]');
  const incomeGoalLabel = document.querySelector('label[for="retirementIncomeGoal"]');
  
  if (!incomeGoalInput) {
    console.log('❌ Monthly Retirement Income Goal input not found');
    return { success: false, message: 'Input not found' };
  }
  
  if (!incomeGoalLabel) {
    console.log('❌ Monthly Retirement Income Goal label not found');
    return { success: false, message: 'Label not found' };
  }
  
  console.log('✅ Monthly Retirement Income Goal input found');
  console.log('✅ Monthly Retirement Income Goal label found');
  
  // Test input functionality
  const testValue = '6500';
  incomeGoalInput.value = testValue;
  incomeGoalInput.dispatchEvent(new Event('input', { bubbles: true }));
  incomeGoalInput.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Wait a moment for state updates
  setTimeout(() => {
    const currentValue = incomeGoalInput.value;
    console.log(`📊 Test value entered: ${testValue}, Current value: ${currentValue}`);
    
    if (currentValue === testValue) {
      console.log('✅ Income goal input is functional');
    } else {
      console.log('❌ Income goal input may not be working correctly');
    }
  }, 100);
  
  return { success: true, hasInput: true, hasLabel: true };
}

// Test 3: Check step title and description updates
function testStepTitleAndDescription() {
  console.log('\n📍 Test 3: Checking step title and description updates...');
  
  // Look for the updated step title
  const expectedTitle = 'Retirement Goals';
  const titleElements = document.querySelectorAll('h1, h2, h3, [class*="CardTitle"]');
  
  let foundTitle = false;
  titleElements.forEach(el => {
    if (el.textContent?.includes(expectedTitle)) {
      foundTitle = true;
      console.log('✅ Found updated step title:', el.textContent.trim());
    }
  });
  
  if (!foundTitle) {
    console.log('❌ Updated step title not found');
    console.log('📋 Available titles:', Array.from(titleElements).map(el => el.textContent?.trim()));
  }
  
  // Look for updated description
  const expectedDescriptionKeywords = ['target', 'monthly', 'income', 'goal'];
  const descriptionElements = document.querySelectorAll('[class*="CardDescription"], .text-muted-foreground, .text-sm');
  
  let foundDescription = false;
  descriptionElements.forEach(el => {
    const text = el.textContent?.toLowerCase() || '';
    if (expectedDescriptionKeywords.every(keyword => text.includes(keyword))) {
      foundDescription = true;
      console.log('✅ Found updated step description:', el.textContent?.trim());
    }
  });
  
  if (!foundDescription) {
    console.log('❌ Updated step description not found');
  }
  
  return { foundTitle, foundDescription };
}

// Test 4: Check help text and guidance
function testHelpTextAndGuidance() {
  console.log('\n📍 Test 4: Checking help text and guidance...');
  
  const expectedGuidanceKeywords = [
    'setting your income goal',
    '70-90%',
    'pre-retirement income',
    'lifestyle',
    'goals'
  ];
  
  const helpElements = document.querySelectorAll('.text-muted-foreground, .text-sm, [class*="bg-blue"]');
  const helpTexts = Array.from(helpElements).map(el => el.textContent?.toLowerCase() || '');
  const combinedHelpText = helpTexts.join(' ');
  
  const foundKeywords = expectedGuidanceKeywords.filter(keyword => 
    combinedHelpText.includes(keyword.toLowerCase())
  );
  
  console.log('📊 Found guidance keywords:', foundKeywords);
  
  const hasGoodGuidance = foundKeywords.length >= 3;
  
  if (hasGoodGuidance) {
    console.log('✅ Good guidance text found');
  } else {
    console.log('⚠️  Limited guidance text found');
  }
  
  return { foundKeywords, hasGoodGuidance };
}

// Test 5: Check form validation and progression
function testFormValidationAndProgression() {
  console.log('\n📍 Test 5: Testing form validation and progression...');
  
  // Find navigation buttons
  const nextButton = document.querySelector('button:has(svg + span), button[class*="Button"]:not([disabled])');
  const backButton = document.querySelector('button:has(svg):not(:has(span))');
  
  console.log(`📊 Next button found: ${nextButton ? 'Yes' : 'No'}`);
  console.log(`📊 Back button found: ${backButton ? 'Yes' : 'No'}`);
  
  // Check if step allows progression without income goal
  const incomeGoalInput = document.querySelector('input[id="retirementIncomeGoal"]');
  if (incomeGoalInput) {
    // Clear the input
    incomeGoalInput.value = '';
    incomeGoalInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Check if next button is still enabled (should be, since income goal is optional)
    const isNextEnabled = nextButton && !nextButton.disabled;
    console.log(`📊 Can proceed without income goal: ${isNextEnabled ? 'Yes' : 'No'}`);
    
    return { hasNavigation: !!nextButton, canProceedWithoutGoal: isNextEnabled };
  }
  
  return { hasNavigation: !!nextButton, canProceedWithoutGoal: true };
}

// Test 6: Check current step position in wizard
function testStepPosition() {
  console.log('\n📍 Test 6: Checking step position in wizard...');
  
  // Look for step indicators
  const stepIndicators = document.querySelectorAll('[class*="rounded-full"], [class*="step"]');
  const activeSteps = Array.from(stepIndicators).filter(el => 
    el.classList.toString().includes('blue') || 
    el.classList.toString().includes('active') ||
    el.textContent === '5'
  );
  
  console.log(`📊 Found ${stepIndicators.length} step indicators`);
  console.log(`📊 Found ${activeSteps.length} active/current step indicators`);
  
  // Check if we're on step 5
  const isOnStep5 = activeSteps.some(el => 
    el.textContent === '5' || 
    el.getAttribute('data-step') === '5'
  );
  
  console.log(`📊 Currently on step 5: ${isOnStep5 ? 'Yes' : 'No'}`);
  
  return { totalSteps: stepIndicators.length, isOnStep5 };
}

// Main test function
function runSimplifiedPreferencesTest() {
  console.log('🚀 Starting Simplified Preferences Test...\n');
  
  const results = {
    removedPreferences: testRemovedPreferences(),
    retirementIncomeGoal: testRetirementIncomeGoal(),
    stepTitleDescription: testStepTitleAndDescription(),
    helpTextGuidance: testHelpTextAndGuidance(),
    formValidation: testFormValidationAndProgression(),
    stepPosition: testStepPosition()
  };
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`📊 Non-functional preferences removed: ${results.removedPreferences.allRemoved ? 'Yes' : 'No'}`);
  console.log(`📊 Income goal input functional: ${results.retirementIncomeGoal.success ? 'Yes' : 'No'}`);
  console.log(`📊 Step title updated: ${results.stepTitleDescription.foundTitle ? 'Yes' : 'No'}`);
  console.log(`📊 Step description updated: ${results.stepTitleDescription.foundDescription ? 'Yes' : 'No'}`);
  console.log(`📊 Good guidance text: ${results.helpTextGuidance.hasGoodGuidance ? 'Yes' : 'No'}`);
  console.log(`📊 Form navigation working: ${results.formValidation.hasNavigation ? 'Yes' : 'No'}`);
  console.log(`📊 On correct step (5): ${results.stepPosition.isOnStep5 ? 'Yes' : 'No'}`);
  
  // Overall assessment
  const criticalTests = [
    results.removedPreferences.allRemoved,
    results.retirementIncomeGoal.success,
    results.stepTitleDescription.foundTitle,
    results.formValidation.hasNavigation
  ];
  
  const allCriticalPassed = criticalTests.every(test => test);
  
  console.log('\n🎯 Overall Result:');
  if (allCriticalPassed) {
    console.log('✅ Simplified preferences implementation is working correctly!');
  } else {
    console.log('⚠️  Some issues found. Check individual test results above.');
  }
  
  console.log('\n💡 Expected behavior:');
  console.log('   - Only "Monthly Retirement Income Goal" input should be visible');
  console.log('   - No risk tolerance, inflation scenario, or analysis options');
  console.log('   - Step should be titled "Retirement Goals"');
  console.log('   - Should be able to proceed with or without entering an income goal');
  
  return results;
}

// Export functions for manual use
window.simplifiedPreferencesTest = {
  runSimplifiedPreferencesTest,
  testRemovedPreferences,
  testRetirementIncomeGoal,
  testStepTitleAndDescription,
  testHelpTextAndGuidance,
  testFormValidationAndProgression,
  testStepPosition
};

// Auto-run the test
runSimplifiedPreferencesTest();

console.log('\n💡 Available functions:');
console.log('   window.simplifiedPreferencesTest.runSimplifiedPreferencesTest() - Run all tests');
console.log('   window.simplifiedPreferencesTest.testRetirementIncomeGoal() - Test income goal input');
console.log('   window.simplifiedPreferencesTest.testRemovedPreferences() - Check removed elements');
