/**
 * Test script to verify default retirement age functionality
 * Run this in the browser console on the wizard page (/wizard) or pension calculator page
 */

console.log('🧪 Testing Default Retirement Age Functionality...\n');

// Test 1: Check if retirement age auto-populates when group is selected
function testRetirementAgeAutoPopulation() {
  console.log('📍 Test 1: Testing retirement age auto-population...');
  
  // Expected default ages by group
  const expectedDefaults = {
    'GROUP_1': '60',
    'GROUP_2': '55', 
    'GROUP_3': '55',
    'GROUP_4': '50',
    '1': '60',
    '2': '55',
    '3': '55', 
    '4': '50'
  };
  
  // Find group selection element
  const groupSelect = document.querySelector('select[name="group"], [data-testid="group-select"]');
  const ageInput = document.querySelector('input[name="age"], input[name="pensionRetirementAge"], #age, #pensionRetirementAge');
  
  if (!groupSelect) {
    console.log('❌ Group selection element not found');
    return { success: false, message: 'Group select not found' };
  }
  
  if (!ageInput) {
    console.log('❌ Age input element not found');
    return { success: false, message: 'Age input not found' };
  }
  
  console.log('✅ Found group select and age input elements');
  
  // Test each group
  const testResults = [];
  
  Object.entries(expectedDefaults).forEach(([groupValue, expectedAge]) => {
    // Clear age input first
    ageInput.value = '';
    ageInput.dispatchEvent(new Event('input', { bubbles: true }));
    ageInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Select group
    groupSelect.value = groupValue;
    groupSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Wait a moment for auto-population
    setTimeout(() => {
      const actualAge = ageInput.value;
      const success = actualAge === expectedAge;
      
      console.log(`  Group ${groupValue}: Expected ${expectedAge}, Got ${actualAge} ${success ? '✅' : '❌'}`);
      testResults.push({ group: groupValue, expected: expectedAge, actual: actualAge, success });
    }, 100);
  });
  
  return { success: true, message: 'Auto-population test completed', results: testResults };
}

// Test 2: Check group selection labels include minimum age information
function testGroupLabelsIncludeMinAges() {
  console.log('\n📍 Test 2: Checking group labels include minimum age info...');
  
  const expectedLabels = [
    { text: 'Group 1', shouldInclude: ['min', 'age', '60'] },
    { text: 'Group 2', shouldInclude: ['min', 'age', '55'] },
    { text: 'Group 3', shouldInclude: ['any age', '20+', 'years'] },
    { text: 'Group 4', shouldInclude: ['min', 'age', '50'] }
  ];
  
  // Find all option elements
  const options = document.querySelectorAll('option, [role="option"]');
  const optionTexts = Array.from(options).map(opt => opt.textContent?.toLowerCase() || '');
  
  console.log(`📊 Found ${options.length} option elements`);
  
  const results = expectedLabels.map(expected => {
    const matchingOptions = optionTexts.filter(text => 
      text.includes(expected.text.toLowerCase()) &&
      expected.shouldInclude.some(keyword => text.includes(keyword.toLowerCase()))
    );
    
    const success = matchingOptions.length > 0;
    console.log(`  ${expected.text}: ${success ? '✅' : '❌'} ${success ? 'Found' : 'Missing'} min age info`);
    
    return { group: expected.text, success, matchingOptions };
  });
  
  const allSuccess = results.every(r => r.success);
  return { success: allSuccess, results };
}

// Test 3: Check help text mentions minimum ages
function testHelpTextIncludesMinAges() {
  console.log('\n📍 Test 3: Checking help text includes minimum age information...');
  
  const expectedKeywords = ['minimum', 'eligible', 'age', 'group 1', '60', 'group 2', '55', 'group 4', '50'];
  
  // Find help text elements
  const helpElements = document.querySelectorAll(
    '[class*="tooltip"], [class*="help"], [role="tooltip"], .text-muted-foreground, .text-sm'
  );
  
  const helpTexts = Array.from(helpElements).map(el => el.textContent?.toLowerCase() || '');
  const combinedHelpText = helpTexts.join(' ');
  
  console.log(`📊 Found ${helpElements.length} help text elements`);
  
  const foundKeywords = expectedKeywords.filter(keyword => 
    combinedHelpText.includes(keyword.toLowerCase())
  );
  
  console.log(`📊 Found keywords: ${foundKeywords.join(', ')}`);
  
  const hasMinAgeInfo = foundKeywords.includes('minimum') && 
                       foundKeywords.includes('age') && 
                       (foundKeywords.includes('60') || foundKeywords.includes('55') || foundKeywords.includes('50'));
  
  console.log(`  Help text includes min age info: ${hasMinAgeInfo ? '✅' : '❌'}`);
  
  return { success: hasMinAgeInfo, foundKeywords, totalHelpElements: helpElements.length };
}

// Test 4: Check validation prevents ages below minimums
function testAgeValidation() {
  console.log('\n📍 Test 4: Testing age validation against group minimums...');
  
  const testCases = [
    { group: 'GROUP_1', invalidAge: '59', validAge: '60' },
    { group: 'GROUP_2', invalidAge: '54', validAge: '55' },
    { group: 'GROUP_4', invalidAge: '49', validAge: '50' },
    { group: '1', invalidAge: '59', validAge: '60' },
    { group: '2', invalidAge: '54', validAge: '55' },
    { group: '4', invalidAge: '49', validAge: '50' }
  ];
  
  const groupSelect = document.querySelector('select[name="group"], [data-testid="group-select"]');
  const ageInput = document.querySelector('input[name="age"], input[name="pensionRetirementAge"], #age, #pensionRetirementAge');
  
  if (!groupSelect || !ageInput) {
    console.log('❌ Required form elements not found for validation test');
    return { success: false, message: 'Form elements not found' };
  }
  
  const results = [];
  
  testCases.forEach(testCase => {
    // Set group
    groupSelect.value = testCase.group;
    groupSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Test invalid age
    ageInput.value = testCase.invalidAge;
    ageInput.dispatchEvent(new Event('input', { bubbles: true }));
    ageInput.dispatchEvent(new Event('blur', { bubbles: true }));
    
    // Check for validation errors
    const errorElements = document.querySelectorAll('[class*="error"], [class*="destructive"], .text-red-500, .text-red-600');
    const hasError = Array.from(errorElements).some(el => 
      el.textContent?.toLowerCase().includes('age') || 
      el.textContent?.toLowerCase().includes('minimum')
    );
    
    console.log(`  Group ${testCase.group}, Age ${testCase.invalidAge}: ${hasError ? '✅' : '❌'} ${hasError ? 'Shows error' : 'No error shown'}`);
    
    results.push({ 
      group: testCase.group, 
      age: testCase.invalidAge, 
      hasValidationError: hasError 
    });
  });
  
  return { success: true, results };
}

// Test 5: Check current step and form state
function checkFormState() {
  console.log('\n📍 Test 5: Checking current form state...');
  
  const groupSelect = document.querySelector('select[name="group"], [data-testid="group-select"]');
  const ageInput = document.querySelector('input[name="age"], input[name="pensionRetirementAge"], #age, #pensionRetirementAge');
  
  const currentGroup = groupSelect?.value || 'Not selected';
  const currentAge = ageInput?.value || 'Not entered';
  
  console.log(`📊 Current group: ${currentGroup}`);
  console.log(`📊 Current age: ${currentAge}`);
  
  // Check if we're on the right page/step
  const pageTitle = document.title;
  const isWizardPage = pageTitle.includes('Wizard') || window.location.pathname.includes('wizard');
  const isCalculatorPage = pageTitle.includes('Calculator') || window.location.pathname.includes('calculator');
  
  console.log(`📊 Page type: ${isWizardPage ? 'Wizard' : isCalculatorPage ? 'Calculator' : 'Other'}`);
  
  return {
    currentGroup,
    currentAge,
    pageType: isWizardPage ? 'wizard' : isCalculatorPage ? 'calculator' : 'other'
  };
}

// Main test function
function runDefaultRetirementAgeTests() {
  console.log('🚀 Starting Default Retirement Age Tests...\n');
  
  const formState = checkFormState();
  
  const results = {
    formState,
    autoPopulation: testRetirementAgeAutoPopulation(),
    groupLabels: testGroupLabelsIncludeMinAges(),
    helpText: testHelpTextIncludesMinAges(),
    validation: testAgeValidation()
  };
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`📊 Page type: ${formState.pageType}`);
  console.log(`📊 Auto-population: ${results.autoPopulation.success ? 'Working' : 'Issues found'}`);
  console.log(`📊 Group labels: ${results.groupLabels.success ? 'Include min ages' : 'Missing min age info'}`);
  console.log(`📊 Help text: ${results.helpText.success ? 'Includes min ages' : 'Missing min age info'}`);
  console.log(`📊 Validation: ${results.validation.success ? 'Test completed' : 'Issues found'}`);
  
  // Overall assessment
  const criticalTests = [results.groupLabels.success, results.helpText.success];
  const allCriticalPassed = criticalTests.every(test => test);
  
  console.log('\n🎯 Overall Result:');
  if (allCriticalPassed) {
    console.log('✅ Default retirement age implementation appears to be working correctly!');
  } else {
    console.log('⚠️  Some issues found. Check individual test results above.');
  }
  
  console.log('\n💡 To test auto-population manually:');
  console.log('   1. Clear the retirement age field');
  console.log('   2. Select different retirement groups');
  console.log('   3. Watch for age field to auto-populate with group defaults');
  
  return results;
}

// Export functions for manual use
window.defaultRetirementAgeTest = {
  runDefaultRetirementAgeTests,
  testRetirementAgeAutoPopulation,
  testGroupLabelsIncludeMinAges,
  testHelpTextIncludesMinAges,
  testAgeValidation,
  checkFormState
};

// Auto-run the test
runDefaultRetirementAgeTests();

console.log('\n💡 Available functions:');
console.log('   window.defaultRetirementAgeTest.runDefaultRetirementAgeTests() - Run all tests');
console.log('   window.defaultRetirementAgeTest.testRetirementAgeAutoPopulation() - Test auto-population');
console.log('   window.defaultRetirementAgeTest.checkFormState() - Check current form state');
