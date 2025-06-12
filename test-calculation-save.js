// Test script to verify calculation saving functionality
const testCalculationData = {
  calculationName: "Test Retirement Calculation",
  retirementDate: "2029-06-15T00:00:00.000Z",
  retirementAge: 65,
  yearsOfService: 30,
  averageSalary: 75000,
  retirementGroup: "1",
  benefitPercentage: 2.5,
  retirementOption: "A",
  monthlyBenefit: 4465,
  annualBenefit: 53580,
  benefitReduction: null,
  survivorBenefit: null,
  notes: "Test calculation for debugging",
  isFavorite: false,
  socialSecurityData: {
    fullRetirementAge: 67,
    earlyRetirementBenefit: 2100,
    fullRetirementBenefit: 2800,
    delayedRetirementBenefit: 3500,
    selectedClaimingAge: 67,
    selectedMonthlyBenefit: 2800,
    combinedMonthlyIncome: 7265,
    replacementRatio: 0.85
  }
}

async function testCalculationSave() {
  try {
    console.log('Testing calculation save...')
    
    const response = await fetch('http://localhost:3000/api/retirement/calculations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This test won't work without proper authentication
        // This is just to test the API structure
      },
      body: JSON.stringify(testCalculationData)
    })
    
    const result = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', result)
    
    if (response.ok) {
      console.log('✅ Calculation save test successful!')
    } else {
      console.log('❌ Calculation save test failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testCalculationSave()
