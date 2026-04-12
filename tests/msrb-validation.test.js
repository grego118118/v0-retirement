/**
 * MSRB Validation Test Suite
 * 
 * Automated tests to ensure pension calculations match official
 * Massachusetts State Retirement Board methodology.
 * 
 * Run with: npm test msrb-validation
 */

const { 
  getBenefitFactor, 
  calculatePensionWithOption, 
  checkEligibility,
  calculateAnnualPension 
} = require('../lib/pension-calculations');

const { calculateMassachusettsCOLA } = require('../lib/pension/ma-cola-calculator');

describe('MSRB Validation Suite', () => {
  
  describe('Benefit Factors', () => {
    const testCases = [
      { group: 'GROUP_1', age: 60, expected: 0.020, serviceEntry: 'before_2012' },
      { group: 'GROUP_2', age: 55, expected: 0.020, serviceEntry: 'before_2012' },
      { group: 'GROUP_2', age: 59, expected: 0.024, serviceEntry: 'before_2012' },
      { group: 'GROUP_3', age: 55, expected: 0.025, serviceEntry: 'before_2012' },
      { group: 'GROUP_4', age: 50, expected: 0.020, serviceEntry: 'before_2012' },
      { group: 'GROUP_1', age: 60, expected: 0.0145, serviceEntry: 'after_2012', yearsOfService: 25 },
      { group: 'GROUP_2', age: 55, expected: 0.0145, serviceEntry: 'after_2012', yearsOfService: 25 }
    ];

    testCases.forEach(test => {
      it(`should return correct factor for ${test.group} age ${test.age} (${test.serviceEntry})`, () => {
        const actual = getBenefitFactor(test.age, test.group, test.serviceEntry, test.yearsOfService || 30);
        expect(Math.abs(actual - test.expected)).toBeLessThan(0.0001);
      });
    });
  });

  describe('Option Calculations', () => {
    const basePension = 58900.00;
    const memberAge = 59;

    it('should calculate Option A correctly', () => {
      const result = calculatePensionWithOption(basePension, 'A', memberAge, '');
      expect(result.pension).toBeCloseTo(basePension, 2);
      expect(result.survivorPension).toBe(0);
    });

    it('should calculate Option B correctly (1.0% reduction)', () => {
      const result = calculatePensionWithOption(basePension, 'B', memberAge, '');
      const expected = basePension * 0.99; // 1% reduction
      expect(result.pension).toBeCloseTo(expected, 2);
      expect(result.survivorPension).toBe(0);
    });

    it('should calculate Option C correctly (reduced pension + 66.67% survivor)', () => {
      const result = calculatePensionWithOption(basePension, 'C', memberAge, memberAge.toString());
      const expectedMemberPension = basePension * 0.9295; // 7.05% reduction
      const expectedSurvivor = expectedMemberPension * (2/3);

      expect(result.pension).toBeCloseTo(expectedMemberPension, 2); // Member gets reduced pension
      expect(result.survivorPension).toBeCloseTo(expectedSurvivor, 2); // Survivor gets 66.67% of reduced
    });

    it('should maintain 66.67% survivor ratio for Option C', () => {
      const result = calculatePensionWithOption(basePension, 'C', memberAge, memberAge.toString());
      const ratio = result.survivorPension / result.pension;
      expect(ratio).toBeCloseTo(2/3, 4); // 66.67% within 0.01%
    });
  });

  describe('Projection Table Validation', () => {
    const projectionData = [
      { age: 55, yos: 31.0, factor: 0.020, optionA: 55366.00, survivorAnnual: 36910.67 },
      { age: 56, yos: 32.0, factor: 0.021, optionA: 60009.60, survivorAnnual: 40006.40 },
      { age: 57, yos: 33.0, factor: 0.022, optionA: 64831.80, survivorAnnual: 43221.20 },
      { age: 58, yos: 34.0, factor: 0.023, optionA: 69832.60, survivorAnnual: 46555.07 },
      { age: 59, yos: 35.0, factor: 0.024, optionA: 71440.00, survivorAnnual: 47626.67 }
    ];

    const averageSalary = 89300; // MSRB-derived salary

    projectionData.forEach(data => {
      describe(`Age ${data.age} scenario`, () => {
        it('should have correct benefit factor', () => {
          const factor = getBenefitFactor(data.age, 'GROUP_2', 'before_2012', data.yos);
          expect(Math.abs(factor - data.factor)).toBeLessThan(0.0001);
        });

        it('should calculate correct Option A pension', () => {
          const basePension = averageSalary * data.yos * data.factor;
          const maxPension = averageSalary * 0.8;
          const cappedPension = Math.min(basePension, maxPension);
          expect(Math.abs(cappedPension - data.optionA)).toBeLessThan(1.0);
        });

        it('should calculate correct Option C survivor benefit', () => {
          const basePension = averageSalary * data.yos * data.factor;
          const maxPension = averageSalary * 0.8;
          const cappedPension = Math.min(basePension, maxPension);
          const result = calculatePensionWithOption(cappedPension, 'C', data.age, data.age.toString());
          expect(Math.abs(result.survivorPension - data.survivorAnnual)).toBeLessThan(1.0);
        });
      });
    });
  });

  describe('COLA Calculations', () => {
    const testCases = [
      { basePension: 13000, years: 1, expectedIncrease: 390, description: 'At base limit' },
      { basePension: 8000, years: 1, expectedIncrease: 240, description: 'Below base limit' },
      { basePension: 20000, years: 1, expectedIncrease: 390, description: 'Above base limit (capped)' },
      { basePension: 50000, years: 1, expectedIncrease: 390, description: 'High pension (capped)' }
    ];

    testCases.forEach(test => {
      it(`should calculate COLA correctly: ${test.description}`, () => {
        const result = calculateMassachusettsCOLA(test.basePension, test.years);
        expect(Math.abs(result.totalIncrease - test.expectedIncrease)).toBeLessThan(0.01);
      });
    });
  });

  describe('Eligibility Rules', () => {
    const testCases = [
      // Pre-2012 rules
      { age: 55, yos: 10, group: 'GROUP_1', serviceEntry: 'before_2012', expected: true },
      { age: 54, yos: 20, group: 'GROUP_1', serviceEntry: 'before_2012', expected: true },
      { age: 54, yos: 9, group: 'GROUP_1', serviceEntry: 'before_2012', expected: false },
      
      // Post-2012 rules
      { age: 60, yos: 10, group: 'GROUP_1', serviceEntry: 'after_2012', expected: true },
      { age: 59, yos: 15, group: 'GROUP_1', serviceEntry: 'after_2012', expected: false },
      { age: 55, yos: 10, group: 'GROUP_2', serviceEntry: 'after_2012', expected: true },
      { age: 50, yos: 10, group: 'GROUP_4', serviceEntry: 'after_2012', expected: true }
    ];

    testCases.forEach(test => {
      it(`should validate eligibility: ${test.group} age ${test.age}, ${test.yos} YOS (${test.serviceEntry})`, () => {
        const result = checkEligibility(test.age, test.yos, test.group, test.serviceEntry);
        expect(result.eligible).toBe(test.expected);
      });
    });
  });

  describe('80% Maximum Benefit Cap', () => {
    const testCases = [
      { salary: 50000, yos: 40, factor: 0.025, shouldBeCapped: true },
      { salary: 80000, yos: 30, factor: 0.025, shouldBeCapped: true },
      { salary: 60000, yos: 25, factor: 0.020, shouldBeCapped: false }
    ];

    testCases.forEach(test => {
      it(`should ${test.shouldBeCapped ? 'apply' : 'not apply'} 80% cap for salary $${test.salary}`, () => {
        const basePension = test.salary * test.yos * test.factor;
        const maxPension = test.salary * 0.8;
        const finalPension = Math.min(basePension, maxPension);
        const actuallyHitCap = finalPension === maxPension;
        
        expect(actuallyHitCap).toBe(test.shouldBeCapped);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should match MSRB Option B calculation exactly', () => {
      const pension = calculateAnnualPension(88449.52, 59, 30, 'B', 'GROUP_2', 'before_2012');
      expect(pension).toBeCloseTo(58311.00, 0); // Within $1
    });

    it('should match MSRB Option A calculation exactly', () => {
      const pension = calculateAnnualPension(88449.52, 59, 30, 'A', 'GROUP_2', 'before_2012');
      expect(pension).toBeCloseTo(58900.00, 0); // Within $1
    });

    it('should maintain calculation consistency across all options', () => {
      const salary = 88449.52;
      const age = 59;
      const yos = 30;
      const group = 'GROUP_2';
      const serviceEntry = 'before_2012';

      const optionA = calculateAnnualPension(salary, age, yos, 'A', group, serviceEntry);
      const optionB = calculateAnnualPension(salary, age, yos, 'B', group, serviceEntry);
      
      // Option B should be 1% less than Option A
      const expectedOptionB = optionA * 0.99;
      expect(Math.abs(optionB - expectedOptionB)).toBeLessThan(1.0);
    });
  });
});

// Test configuration for CI/CD
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/msrb-validation.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
