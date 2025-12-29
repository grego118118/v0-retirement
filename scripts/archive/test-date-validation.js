/**
 * Test script to verify date validation logic
 * Tests the safeToISOString function with various date scenarios
 */

// Safe date utility function (copied from subscription status route)
const safeToISOString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to ISO string:', error, 'Date value:', date);
    return undefined;
  }
};

console.log('🧪 Testing Date Validation Logic...\n');

// Test cases
const testCases = [
  { name: 'Valid Date', value: new Date('2024-12-31') },
  { name: 'Current Date', value: new Date() },
  { name: 'Null Value', value: null },
  { name: 'Undefined Value', value: undefined },
  { name: 'Invalid Date String', value: new Date('invalid-date') },
  { name: 'Empty String Date', value: new Date('') },
  { name: 'NaN Date', value: new Date(NaN) },
  { name: 'String (not Date)', value: '2024-12-31' },
  { name: 'Number (not Date)', value: 1234567890 },
  { name: 'Object (not Date)', value: { year: 2024 } },
  { name: 'Future Date', value: new Date('2030-01-01') },
  { name: 'Past Date', value: new Date('1990-01-01') }
];

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. Testing: ${testCase.name}`);
  console.log(`   Input: ${testCase.value}`);
  console.log(`   Type: ${typeof testCase.value}`);
  console.log(`   Is Date: ${testCase.value instanceof Date}`);
  
  if (testCase.value instanceof Date) {
    console.log(`   Is Valid Date: ${!isNaN(testCase.value.getTime())}`);
  }
  
  const result = safeToISOString(testCase.value);
  console.log(`   Result: ${result}`);
  console.log(`   Status: ${result ? '✅ SUCCESS' : '⚠️  SAFE FALLBACK'}\n`);
});

console.log('🎉 Date validation testing complete!');
console.log('All test cases handled safely without throwing RangeError.');
