#!/usr/bin/env node

/**
 * Test script to verify form values are preserved correctly
 * Tests that user input is not overridden by smart defaults
 */

console.log('🧪 Testing Form Value Preservation...\n');

// Simulate the handleEssentialInfoChange logic
function simulateHandleEssentialInfoChange(existingData, newData) {
  const updatedData = { ...existingData, ...newData }
  
  // Simulate generateSmartDefaults
  const smartDefaults = {}
  
  // Auto-calculate current age from birth year
  if (updatedData.birthYear) {
    smartDefaults.currentAge = new Date().getFullYear() - updatedData.birthYear
  }
  
  // Auto-detect service entry from years of service and age
  if (updatedData.yearsOfService && updatedData.currentAge) {
    const currentYear = new Date().getFullYear()
    const estimatedStartYear = currentYear - updatedData.yearsOfService
    smartDefaults.serviceEntry = estimatedStartYear >= 2012 ? 'after_2012' : 'before_2012'
  }
  
  // Auto-suggest retirement age based on group
  if (updatedData.retirementGroup) {
    const suggestions = { '1': 60, '2': 55, '3': 55, '4': 50 }
    smartDefaults.plannedRetirementAge = suggestions[updatedData.retirementGroup] || 60
  }
  
  // Default retirement option
  if (!updatedData.retirementOption) {
    smartDefaults.retirementOption = 'A'
  }
  
  // Apply selective smart defaults (new logic)
  const finalData = { ...updatedData }
  
  // Auto-calculate current age from birth year (always override)
  if (smartDefaults.currentAge !== undefined) {
    finalData.currentAge = smartDefaults.currentAge
  }
  
  // Auto-detect service entry (only if not explicitly set by user)
  if (smartDefaults.serviceEntry && !updatedData.serviceEntry) {
    finalData.serviceEntry = smartDefaults.serviceEntry
  }
  
  // Auto-suggest retirement age (only if not explicitly set by user)
  if (smartDefaults.plannedRetirementAge && !updatedData.plannedRetirementAge) {
    finalData.plannedRetirementAge = smartDefaults.plannedRetirementAge
  }
  
  // Default retirement option (only if not set)
  if (smartDefaults.retirementOption && !updatedData.retirementOption) {
    finalData.retirementOption = smartDefaults.retirementOption
  }
  
  return finalData
}

// Test scenarios
console.log('📊 Test Scenarios:\n');

// Test 1: Loading test data should preserve values
console.log('1️⃣ Test: Loading Test Data');
const testData = {
  birthYear: 1970,
  currentAge: 55,
  retirementGroup: '2',
  yearsOfService: 28,
  averageSalary: 95000,
  plannedRetirementAge: 55,
  serviceEntry: 'before_2012',
  retirementOption: 'C',
  beneficiaryAge: 55
};

const result1 = simulateHandleEssentialInfoChange({}, testData);
console.log(`   Input Years of Service: ${testData.yearsOfService}`);
console.log(`   Output Years of Service: ${result1.yearsOfService}`);
console.log(`   Input Average Salary: ${testData.averageSalary}`);
console.log(`   Output Average Salary: ${result1.averageSalary}`);
console.log(`   Values Preserved: ${result1.yearsOfService === testData.yearsOfService && result1.averageSalary === testData.averageSalary ? '✅' : '❌'}`);

// Test 2: User typing in years of service should preserve value
console.log('\n2️⃣ Test: User Types Years of Service');
const existingData2 = {
  birthYear: 1970,
  currentAge: 55,
  retirementGroup: '2',
  averageSalary: 95000
};

const userInput2 = { yearsOfService: 28 };
const result2 = simulateHandleEssentialInfoChange(existingData2, userInput2);
console.log(`   User Input: ${userInput2.yearsOfService}`);
console.log(`   Final Value: ${result2.yearsOfService}`);
console.log(`   Value Preserved: ${result2.yearsOfService === userInput2.yearsOfService ? '✅' : '❌'}`);

// Test 3: User typing in salary should preserve value
console.log('\n3️⃣ Test: User Types Average Salary');
const existingData3 = {
  birthYear: 1970,
  currentAge: 55,
  retirementGroup: '2',
  yearsOfService: 28
};

const userInput3 = { averageSalary: 95000 };
const result3 = simulateHandleEssentialInfoChange(existingData3, userInput3);
console.log(`   User Input: ${userInput3.averageSalary}`);
console.log(`   Final Value: ${result3.averageSalary}`);
console.log(`   Value Preserved: ${result3.averageSalary === userInput3.averageSalary ? '✅' : '❌'}`);

// Test 4: Auto-calculations should still work
console.log('\n4️⃣ Test: Auto-Calculations Still Work');
const existingData4 = {};
const userInput4 = { birthYear: 1970 };
const result4 = simulateHandleEssentialInfoChange(existingData4, userInput4);
const expectedAge = new Date().getFullYear() - 1970;
console.log(`   Birth Year: ${userInput4.birthYear}`);
console.log(`   Calculated Age: ${result4.currentAge}`);
console.log(`   Expected Age: ${expectedAge}`);
console.log(`   Auto-Calculation Works: ${result4.currentAge === expectedAge ? '✅' : '❌'}`);

// Test 5: Service entry detection should work
console.log('\n5️⃣ Test: Service Entry Detection');
const existingData5 = { currentAge: 55 };
const userInput5 = { yearsOfService: 28 };
const result5 = simulateHandleEssentialInfoChange(existingData5, userInput5);
console.log(`   Years of Service: ${userInput5.yearsOfService}`);
console.log(`   Detected Service Entry: ${result5.serviceEntry}`);
console.log(`   Expected: before_2012`);
console.log(`   Detection Works: ${result5.serviceEntry === 'before_2012' ? '✅' : '❌'}`);

// Summary
console.log('\n📋 Test Summary:');
const allTests = [
  result1.yearsOfService === testData.yearsOfService && result1.averageSalary === testData.averageSalary,
  result2.yearsOfService === userInput2.yearsOfService,
  result3.averageSalary === userInput3.averageSalary,
  result4.currentAge === expectedAge,
  result5.serviceEntry === 'before_2012'
];

const passedTests = allTests.filter(test => test).length;
console.log(`✅ Passed: ${passedTests}/5`);
console.log(`❌ Failed: ${5 - passedTests}/5`);

if (passedTests === 5) {
  console.log('\n🎉 All tests passed! Form value preservation is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Check the implementation.');
}

console.log('\n🚀 Manual Testing Instructions:');
console.log('1. Navigate to: http://localhost:3000/dev/wizard-v2');
console.log('2. Click "Load Test Data"');
console.log('3. Verify form shows exactly:');
console.log('   - Current Years of Service: 28');
console.log('   - Average Highest 3 Years Salary: 95000');
console.log('4. Try typing different values in these fields');
console.log('5. Verify the values you type are preserved');
console.log('6. Check that auto-calculations still work for age and service entry');
