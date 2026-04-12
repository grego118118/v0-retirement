const { generateProjectionTable } = require('./lib/pension-calculations.ts');

console.log('🔍 Testing Projection Table 80% Cap Fix');
console.log('=======================================');

// Test scenario that would exceed 80% without cap
const testData = generateProjectionTable(
  'GROUP_2',      // Group 2
  55,             // Starting age 55
  31,             // Starting YOS 31
  95000,          // Average salary
  'C',            // Option C
  '55',           // Beneficiary age
  'before_2012'   // Service entry
);

console.log('\n📊 Projection Table Results:');
console.log('Age | YOS  | Factor | Total % | Status');
console.log('----+------+--------+---------+--------');

let violations = 0;
testData.rows.forEach(row => {
  const percentage = (row.totalBenefitPercentage * 100).toFixed(1);
  const factor = (row.factor * 100).toFixed(1);
  const exceedsLimit = row.totalBenefitPercentage > 0.8001; // Small tolerance for rounding
  
  if (exceedsLimit) violations++;
  
  const status = exceedsLimit ? '❌ VIOLATION!' : '✅ OK';
  console.log(`${row.age.toString().padStart(3)} | ${row.yearsOfService.toFixed(1).padStart(4)} | ${factor.padStart(5)}% | ${percentage.padStart(6)}% | ${status}`);
});

console.log('\n🎯 Test Results:');
console.log(`Total Violations: ${violations}`);
console.log(`80% Cap Working: ${violations === 0 ? '✅ YES' : '❌ NO'}`);

if (violations === 0) {
  console.log('\n🎉 SUCCESS: Projection table properly caps at 80%!');
} else {
  console.log('\n⚠️  FAILURE: Projection table still shows values above 80%!');
}
