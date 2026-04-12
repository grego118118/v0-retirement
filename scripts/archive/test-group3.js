/**
 * Test script to verify Group 3 pension calculations
 */

// Import the pension calculation functions
const { calculatePensionBenefit, checkEligibility } = require('./lib/pension-calculations.ts');

// Test Group 3 calculations
console.log('Testing Group 3 (State Police) Pension Calculations');
console.log('='.repeat(50));

// Test case 1: Group 3 member, age 55, 25 years of service, $80,000 salary
const testCase1 = {
  age: 55,
  yearsOfService: 25,
  group: 'GROUP_3',
  averageSalary: 80000,
  serviceEntry: 'before_2012'
};

console.log('\nTest Case 1: Group 3, Age 55, 25 YOS, $80,000 salary, hired before 2012');
console.log('Input:', testCase1);

try {
  const eligibility1 = checkEligibility(testCase1.age, testCase1.yearsOfService, testCase1.group, testCase1.serviceEntry);
  console.log('Eligibility:', eligibility1);
  
  if (eligibility1.eligible) {
    const benefit1 = calculatePensionBenefit(
      testCase1.averageSalary,
      testCase1.age,
      testCase1.yearsOfService,
      testCase1.group,
      testCase1.serviceEntry,
      'A'
    );
    console.log('Calculated Benefit:', benefit1);
  }
} catch (error) {
  console.error('Error in test case 1:', error.message);
}

// Test case 2: Group 3 member, age 55, 25 years of service, hired after 2012
const testCase2 = {
  age: 55,
  yearsOfService: 25,
  group: 'GROUP_3',
  averageSalary: 80000,
  serviceEntry: 'after_2012'
};

console.log('\nTest Case 2: Group 3, Age 55, 25 YOS, $80,000 salary, hired after 2012');
console.log('Input:', testCase2);

try {
  const eligibility2 = checkEligibility(testCase2.age, testCase2.yearsOfService, testCase2.group, testCase2.serviceEntry);
  console.log('Eligibility:', eligibility2);
  
  if (eligibility2.eligible) {
    const benefit2 = calculatePensionBenefit(
      testCase2.averageSalary,
      testCase2.age,
      testCase2.yearsOfService,
      testCase2.group,
      testCase2.serviceEntry,
      'A'
    );
    console.log('Calculated Benefit:', benefit2);
  }
} catch (error) {
  console.error('Error in test case 2:', error.message);
}

// Test case 3: Group 3 member, age 54, 20 years of service (should not be eligible if hired after 2012)
const testCase3 = {
  age: 54,
  yearsOfService: 20,
  group: 'GROUP_3',
  averageSalary: 75000,
  serviceEntry: 'after_2012'
};

console.log('\nTest Case 3: Group 3, Age 54, 20 YOS, $75,000 salary, hired after 2012 (should be ineligible)');
console.log('Input:', testCase3);

try {
  const eligibility3 = checkEligibility(testCase3.age, testCase3.yearsOfService, testCase3.group, testCase3.serviceEntry);
  console.log('Eligibility:', eligibility3);
} catch (error) {
  console.error('Error in test case 3:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('Group 3 testing completed');
