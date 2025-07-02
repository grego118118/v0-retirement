/**
 * Test script to verify the Analysis & Optimization step removal
 * Run this in the browser console on the wizard page (/wizard)
 */

console.log('🧪 Testing Wizard Step Removal...\n');

// Test 1: Check total number of steps
function checkTotalSteps() {
  console.log('📍 Test 1: Checking total number of steps...');
  
  // Look for step indicators
  const stepElements = document.querySelectorAll('[class*="rounded-full"]');
  const stepConnectors = document.querySelectorAll('[class*="w-8"][class*="h-0.5"]');
  
  console.log(`📊 Step indicators found: ${stepElements.length}`);
  console.log(`📊 Step connectors found: ${stepConnectors.length}`);
  
  // Expected: 6 steps (was 7, removed 1)
  const expectedSteps = 6;
  const actualSteps = stepElements.length;
  
  if (actualSteps === expectedSteps) {
    console.log(`✅ Correct number of steps: ${actualSteps}/${expectedSteps}`);
  } else {
    console.log(`❌ Incorrect number of steps: ${actualSteps}/${expectedSteps}`);
  }
  
  return { expected: expectedSteps, actual: actualSteps, correct: actualSteps === expectedSteps };
}

// Test 2: Check step titles to ensure "Analysis & Optimization" is removed
function checkStepTitles() {
  console.log('\n📍 Test 2: Checking step titles...');
  
  const expectedSteps = [
    'Personal Information',
    'Pension Details', 
    'Social Security',
    'Additional Income & Assets',
    'Goals & Preferences',
    'Review & Save'
  ];
  
  // Look for step titles in the page
  const titleElements = document.querySelectorAll('h1, h2, h3, [class*="CardTitle"]');
  const foundTitles = [];
  
  titleElements.forEach(el => {
    const text = el.textContent?.trim();
    if (text && expectedSteps.some(step => text.includes(step.split(' ')[0]))) {
      foundTitles.push(text);
    }
  });
  
  console.log('📋 Expected steps:', expectedSteps);
  console.log('📋 Found titles:', foundTitles);
  
  // Check if "Analysis & Optimization" appears anywhere
  const hasOptimizationStep = Array.from(titleElements).some(el => 
    el.textContent?.includes('Analysis') && el.textContent?.includes('Optimization')
  );
  
  if (hasOptimizationStep) {
    console.log('❌ "Analysis & Optimization" step still found in page');
  } else {
    console.log('✅ "Analysis & Optimization" step successfully removed');
  }
  
  return { expectedSteps, foundTitles, hasOptimizationStep: !hasOptimizationStep };
}

// Test 3: Check navigation buttons
function checkNavigationButtons() {
  console.log('\n📍 Test 3: Checking navigation buttons...');
  
  const buttons = document.querySelectorAll('button');
  const buttonTexts = Array.from(buttons).map(btn => btn.textContent?.trim()).filter(Boolean);
  
  console.log('📋 All button texts:', buttonTexts);
  
  // Check for "Complete Analysis" button (should be removed)
  const hasCompleteAnalysis = buttonTexts.some(text => 
    text?.includes('Complete Analysis')
  );
  
  // Check for "Save Results" button (should be present)
  const hasSaveResults = buttonTexts.some(text => 
    text?.includes('Save Results') || text?.includes('Save')
  );
  
  if (hasCompleteAnalysis) {
    console.log('❌ "Complete Analysis" button still found');
  } else {
    console.log('✅ "Complete Analysis" button successfully removed');
  }
  
  if (hasSaveResults) {
    console.log('✅ "Save Results" or similar button found');
  } else {
    console.log('⚠️  No "Save Results" button found');
  }
  
  return { 
    hasCompleteAnalysis: !hasCompleteAnalysis, 
    hasSaveResults,
    allButtons: buttonTexts 
  };
}

// Test 4: Test step navigation flow
function testStepNavigation() {
  console.log('\n📍 Test 4: Testing step navigation flow...');
  
  // Get current step
  const activeSteps = document.querySelectorAll('[class*="bg-blue-600"]');
  const currentStepIndex = activeSteps.length - 1; // Assuming last active is current
  
  console.log(`📊 Current step appears to be: ${currentStepIndex + 1}`);
  
  // Try to find next button
  const buttons = document.querySelectorAll('button');
  const nextButton = Array.from(buttons).find(btn => 
    btn.textContent?.toLowerCase().includes('next') ||
    btn.textContent?.toLowerCase().includes('continue')
  );
  
  if (nextButton) {
    console.log(`✅ Next button found: "${nextButton.textContent}"`);
    console.log(`🎛️  Next button enabled: ${!nextButton.disabled}`);
  } else {
    console.log('❌ Next button not found');
  }
  
  return { currentStep: currentStepIndex, hasNextButton: !!nextButton };
}

// Test 5: Check for optimization-related content
function checkOptimizationContent() {
  console.log('\n📍 Test 5: Checking for optimization-related content...');
  
  const pageText = document.body.textContent || '';
  const optimizationKeywords = [
    'optimization',
    'optimize',
    'analysis complete',
    'recommended strategy',
    'alternative scenarios',
    'claiming strategies'
  ];
  
  const foundKeywords = optimizationKeywords.filter(keyword => 
    pageText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  console.log('🔍 Optimization keywords found:', foundKeywords);
  
  if (foundKeywords.length === 0) {
    console.log('✅ No optimization-related content found (good)');
  } else {
    console.log('⚠️  Some optimization content still present');
  }
  
  return { foundKeywords, hasOptimizationContent: foundKeywords.length > 0 };
}

// Main test function
function runStepRemovalTest() {
  console.log('🚀 Starting Wizard Step Removal Test...\n');
  
  const results = {
    totalSteps: checkTotalSteps(),
    stepTitles: checkStepTitles(),
    navigationButtons: checkNavigationButtons(),
    stepNavigation: testStepNavigation(),
    optimizationContent: checkOptimizationContent()
  };
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`📊 Correct step count: ${results.totalSteps.correct ? 'Yes' : 'No'} (${results.totalSteps.actual}/${results.totalSteps.expected})`);
  console.log(`📊 Optimization step removed: ${results.stepTitles.hasOptimizationStep ? 'Yes' : 'No'}`);
  console.log(`📊 Complete Analysis button removed: ${results.navigationButtons.hasCompleteAnalysis ? 'Yes' : 'No'}`);
  console.log(`📊 Save Results button present: ${results.navigationButtons.hasSaveResults ? 'Yes' : 'No'}`);
  console.log(`📊 Navigation working: ${results.stepNavigation.hasNextButton ? 'Yes' : 'No'}`);
  console.log(`📊 Optimization content cleaned: ${!results.optimizationContent.hasOptimizationContent ? 'Yes' : 'No'}`);
  
  // Overall assessment
  const allTestsPassed = 
    results.totalSteps.correct &&
    results.stepTitles.hasOptimizationStep &&
    results.navigationButtons.hasCompleteAnalysis &&
    results.navigationButtons.hasSaveResults &&
    results.stepNavigation.hasNextButton;
  
  console.log('\n🎯 Overall Result:');
  if (allTestsPassed) {
    console.log('✅ All tests passed! Step removal was successful.');
  } else {
    console.log('⚠️  Some tests failed. Check individual results above.');
  }
  
  return results;
}

// Export functions for manual use
window.stepRemovalTest = {
  runStepRemovalTest,
  checkTotalSteps,
  checkStepTitles,
  checkNavigationButtons,
  testStepNavigation,
  checkOptimizationContent
};

// Auto-run the test
runStepRemovalTest();

console.log('\n💡 Available functions:');
console.log('   window.stepRemovalTest.runStepRemovalTest() - Run full test again');
console.log('   window.stepRemovalTest.checkTotalSteps() - Check step count');
console.log('   window.stepRemovalTest.checkNavigationButtons() - Check button changes');
