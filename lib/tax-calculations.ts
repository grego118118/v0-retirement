// Tax calculation utilities for federal and Massachusetts state taxes
// Based on 2024 tax brackets and Massachusetts tax laws

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxCalculationResult {
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
  breakdown: {
    federal: TaxBreakdown;
    state: TaxBreakdown;
  };
}

export interface TaxBreakdown {
  brackets: Array<{
    rate: number;
    income: number;
    tax: number;
  }>;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
}

export interface SocialSecurityTaxInfo {
  taxableAmount: number;
  taxablePercentage: number;
  federalTax: number;
}

// 2024 Federal Tax Brackets
export const FEDERAL_TAX_BRACKETS_2024: Record<string, TaxBracket[]> = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11601, max: 47150, rate: 0.12 },
    { min: 47151, max: 100525, rate: 0.22 },
    { min: 100526, max: 191950, rate: 0.24 },
    { min: 191951, max: 243725, rate: 0.32 },
    { min: 243726, max: 609350, rate: 0.35 },
    { min: 609351, max: null, rate: 0.37 }
  ],
  marriedFilingJointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23201, max: 94300, rate: 0.12 },
    { min: 94301, max: 201050, rate: 0.22 },
    { min: 201051, max: 383900, rate: 0.24 },
    { min: 383901, max: 487450, rate: 0.32 },
    { min: 487451, max: 731200, rate: 0.35 },
    { min: 731201, max: null, rate: 0.37 }
  ],
  marriedFilingSeparately: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11601, max: 47150, rate: 0.12 },
    { min: 47151, max: 100525, rate: 0.22 },
    { min: 100526, max: 191950, rate: 0.24 },
    { min: 191951, max: 243725, rate: 0.32 },
    { min: 243726, max: 365600, rate: 0.35 },
    { min: 365601, max: null, rate: 0.37 }
  ],
  headOfHousehold: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16551, max: 63100, rate: 0.12 },
    { min: 63101, max: 100500, rate: 0.22 },
    { min: 100501, max: 191950, rate: 0.24 },
    { min: 191951, max: 243700, rate: 0.32 },
    { min: 243701, max: 609350, rate: 0.35 },
    { min: 609351, max: null, rate: 0.37 }
  ]
};

// 2024 Standard Deductions
export const STANDARD_DEDUCTIONS_2024: Record<string, number> = {
  single: 14600,
  marriedFilingJointly: 29200,
  marriedFilingSeparately: 14600,
  headOfHousehold: 21900
};

// Massachusetts Tax Information
export const MA_TAX_RATE = 0.05; // 5.0% flat rate
export const MA_STANDARD_DEDUCTION_2024 = 4400; // Single filer
export const MA_PERSONAL_EXEMPTION_2024 = 4400; // Per person

// Social Security taxation thresholds
export const SS_TAXATION_THRESHOLDS = {
  single: {
    noTax: 25000,
    partialTax: 34000
  },
  marriedFilingJointly: {
    noTax: 32000,
    partialTax: 44000
  }
};

/**
 * Calculate federal income tax using progressive tax brackets
 */
export function calculateFederalTax(
  taxableIncome: number,
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS_2024
): TaxBreakdown {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus];
  const breakdown: TaxBreakdown['brackets'] = [];
  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketMax = bracket.max || Infinity;
    const incomeInBracket = Math.min(remainingIncome, bracketMax - bracket.min + 1);
    
    if (incomeInBracket > 0) {
      const taxInBracket = incomeInBracket * bracket.rate;
      totalTax += taxInBracket;
      
      breakdown.push({
        rate: bracket.rate,
        income: incomeInBracket,
        tax: taxInBracket
      });

      remainingIncome -= incomeInBracket;
    }
  }

  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;
  const marginalRate = getMarginalTaxRate(taxableIncome, brackets);

  return {
    brackets: breakdown,
    totalTax,
    effectiveRate,
    marginalRate
  };
}

/**
 * Calculate Massachusetts state income tax
 */
export function calculateMassachusettsTax(
  federalAGI: number,
  filingStatus: string,
  age65OrOlder: boolean = false
): TaxBreakdown {
  // Massachusetts uses federal AGI as starting point
  let maAGI = federalAGI;
  
  // Apply Massachusetts deductions
  let deduction = MA_STANDARD_DEDUCTION_2024;
  if (filingStatus === 'marriedFilingJointly') {
    deduction = MA_STANDARD_DEDUCTION_2024 * 2;
  }

  // Personal exemptions
  let exemptions = MA_PERSONAL_EXEMPTION_2024;
  if (filingStatus === 'marriedFilingJointly') {
    exemptions = MA_PERSONAL_EXEMPTION_2024 * 2;
  }

  // Age 65+ exemption ($700)
  if (age65OrOlder) {
    exemptions += 700;
    if (filingStatus === 'marriedFilingJointly') {
      exemptions += 700; // Assuming both spouses are 65+
    }
  }

  const taxableIncome = Math.max(0, maAGI - deduction - exemptions);
  const totalTax = taxableIncome * MA_TAX_RATE;

  return {
    brackets: [{
      rate: MA_TAX_RATE,
      income: taxableIncome,
      tax: totalTax
    }],
    totalTax,
    effectiveRate: federalAGI > 0 ? totalTax / federalAGI : 0,
    marginalRate: MA_TAX_RATE
  };
}

/**
 * Calculate Social Security taxation
 */
export function calculateSocialSecurityTax(
  socialSecurityBenefit: number,
  otherIncome: number,
  filingStatus: 'single' | 'marriedFilingJointly'
): SocialSecurityTaxInfo {
  const combinedIncome = otherIncome + (socialSecurityBenefit * 0.5);
  const thresholds = SS_TAXATION_THRESHOLDS[filingStatus];
  
  let taxableAmount = 0;
  let taxablePercentage = 0;

  if (combinedIncome <= thresholds.noTax) {
    // No taxation
    taxableAmount = 0;
    taxablePercentage = 0;
  } else if (combinedIncome <= thresholds.partialTax) {
    // Up to 50% taxable
    const excessIncome = combinedIncome - thresholds.noTax;
    taxableAmount = Math.min(excessIncome, socialSecurityBenefit * 0.5);
    taxablePercentage = taxableAmount / socialSecurityBenefit;
  } else {
    // Up to 85% taxable
    const firstTierTax = Math.min(
      thresholds.partialTax - thresholds.noTax,
      socialSecurityBenefit * 0.5
    );
    const secondTierIncome = combinedIncome - thresholds.partialTax;
    const secondTierTax = Math.min(
      secondTierIncome * 0.85,
      socialSecurityBenefit * 0.85 - firstTierTax
    );
    
    taxableAmount = firstTierTax + secondTierTax;
    taxablePercentage = taxableAmount / socialSecurityBenefit;
  }

  return {
    taxableAmount,
    taxablePercentage,
    federalTax: 0 // Will be calculated as part of total income
  };
}

/**
 * Get marginal tax rate for given income
 */
function getMarginalTaxRate(income: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    const bracketMax = bracket.max || Infinity;
    if (income >= bracket.min && income <= bracketMax) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1].rate;
}

/**
 * Calculate comprehensive tax implications for retirement income
 */
export function calculateRetirementTaxes(
  pensionIncome: number,
  socialSecurityBenefit: number,
  otherIncome: number = 0,
  filingStatus: keyof typeof FEDERAL_TAX_BRACKETS_2024,
  age65OrOlder: boolean = false
): TaxCalculationResult {
  // Calculate Social Security taxation
  const ssFilingStatus = filingStatus === 'marriedFilingJointly' ? 'marriedFilingJointly' : 'single';
  const ssTaxInfo = calculateSocialSecurityTax(socialSecurityBenefit, pensionIncome + otherIncome, ssFilingStatus);
  
  // Total income for federal tax calculation
  const totalIncome = pensionIncome + ssTaxInfo.taxableAmount + otherIncome;
  
  // Apply standard deduction
  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
  const federalTaxableIncome = Math.max(0, totalIncome - standardDeduction);
  
  // Calculate federal taxes
  const federalBreakdown = calculateFederalTax(federalTaxableIncome, filingStatus);
  
  // Calculate Massachusetts taxes (pension income is taxable, SS is not)
  const maBreakdown = calculateMassachusettsTax(pensionIncome + otherIncome, filingStatus, age65OrOlder);
  
  const grossIncome = pensionIncome + socialSecurityBenefit + otherIncome;
  const totalTax = federalBreakdown.totalTax + maBreakdown.totalTax;
  const netIncome = grossIncome - totalTax;
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  
  // Marginal rate is the higher of federal or state marginal rates
  const marginalRate = Math.max(federalBreakdown.marginalRate, maBreakdown.marginalRate);

  return {
    grossIncome,
    federalTax: federalBreakdown.totalTax,
    stateTax: maBreakdown.totalTax,
    totalTax,
    netIncome,
    effectiveRate,
    marginalRate,
    breakdown: {
      federal: federalBreakdown,
      state: maBreakdown
    }
  };
}
