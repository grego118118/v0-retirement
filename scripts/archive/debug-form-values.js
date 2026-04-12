#!/usr/bin/env node

/**
 * Debug script to check what values are being set in the form
 */

console.log('🔍 Debugging Form Values...\n');

// Test the current test data values
const currentTestData = {
  birthYear: 1968,
  currentAge: 55,
  retirementGroup: '2',
  yearsOfService: 28,
  averageSalary: 95000,
  plannedRetirementAge: 55,
  serviceEntry: 'before_2012',
  retirementOption: 'C',
  beneficiaryAge: 55
};

console.log('📊 Current Test Data Values:');
console.log(`   Birth Year: ${currentTestData.birthYear}`);
console.log(`   Current Age: ${currentTestData.currentAge}`);
console.log(`   Retirement Group: ${currentTestData.retirementGroup}`);
console.log(`   Years of Service: ${currentTestData.yearsOfService}`);
console.log(`   Average Salary: $${currentTestData.averageSalary.toLocaleString()}`);
console.log(`   Planned Retirement Age: ${currentTestData.plannedRetirementAge}`);
console.log(`   Service Entry: ${currentTestData.serviceEntry}`);
console.log(`   Retirement Option: ${currentTestData.retirementOption}`);
console.log(`   Beneficiary Age: ${currentTestData.beneficiaryAge}`);

// Check if there are any auto-calculation issues
console.log('\n🔧 Auto-Calculation Checks:');

// Check age calculation
const calculatedAge = new Date().getFullYear() - currentTestData.birthYear;
console.log(`   Calculated Age from Birth Year: ${calculatedAge}`);
console.log(`   Expected Age: ${currentTestData.currentAge}`);
console.log(`   Age Match: ${calculatedAge === currentTestData.currentAge ? '✅' : '❌'}`);

// Check service entry detection
const currentYear = new Date().getFullYear();
const estimatedStartYear = currentYear - currentTestData.yearsOfService;
const detectedServiceEntry = estimatedStartYear >= 2012 ? 'after_2012' : 'before_2012';
console.log(`   Estimated Start Year: ${estimatedStartYear}`);
console.log(`   Detected Service Entry: ${detectedServiceEntry}`);
console.log(`   Expected Service Entry: ${currentTestData.serviceEntry}`);
console.log(`   Service Entry Match: ${detectedServiceEntry === currentTestData.serviceEntry ? '✅' : '❌'}`);

// Check if values are being parsed correctly
console.log('\n📝 Value Parsing Checks:');
console.log(`   Years of Service Type: ${typeof currentTestData.yearsOfService}`);
console.log(`   Average Salary Type: ${typeof currentTestData.averageSalary}`);
console.log(`   Years of Service Value: ${currentTestData.yearsOfService}`);
console.log(`   Average Salary Value: ${currentTestData.averageSalary}`);

// Test parseFloat and parseInt
const testYearsInput = "28";
const testSalaryInput = "95000";
console.log(`   parseFloat("${testYearsInput}"): ${parseFloat(testYearsInput)}`);
console.log(`   parseFloat("${testSalaryInput}"): ${parseFloat(testSalaryInput)}`);

console.log('\n🎯 Expected Form Behavior:');
console.log('1. Load Test Data should set:');
console.log(`   - Years of Service: 28`);
console.log(`   - Average Salary: 95000`);
console.log('2. Form should display these exact values');
console.log('3. No auto-population should override user input');
console.log('4. Values should persist when user types');

console.log('\n🚀 Testing Instructions:');
console.log('1. Navigate to: http://localhost:3000/dev/wizard-v2');
console.log('2. Click "Load Test Data"');
console.log('3. Verify form shows:');
console.log('   - Current Years of Service: 28');
console.log('   - Average Highest 3 Years Salary: 95000');
console.log('4. Try typing in the fields to ensure values persist');
console.log('5. Check if any auto-population is overriding the values');

console.log('\n🔍 Potential Issues to Check:');
console.log('- useEffect hooks triggering unwanted updates');
console.log('- Smart defaults overriding user input');
console.log('- Number parsing issues (parseFloat vs parseInt)');
console.log('- Form state management conflicts');
console.log('- Test data loading timing issues');
