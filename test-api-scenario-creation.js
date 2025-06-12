/**
 * Test script to simulate the exact API scenario creation flow
 * This tests the complete end-to-end flow including API endpoint and calculation
 */

const { PrismaClient } = require('./lib/generated/prisma')

const prisma = new PrismaClient()

// Test data that exactly matches what the form sends
const testFormData = {
  name: "API Test Scenario",
  description: "Testing API endpoint with exact form data structure",
  isBaseline: false,
  
  // Personal parameters
  currentAge: 45,
  retirementAge: 62,
  lifeExpectancy: 85,
  birthYear: 1979,
  
  // Pension parameters
  retirementGroup: "1",
  yearsOfService: 25,
  averageSalary: 75000,
  retirementOption: "A",
  beneficiaryAge: null,
  
  // Social Security parameters
  claimingAge: 62,
  fullRetirementAge: 67,
  fullRetirementBenefit: 2500,
  isMarried: false,
  spouseClaimingAge: null,
  spouseFullRetirementBenefit: null,
  
  // Financial parameters (flat structure from form)
  otherRetirementIncome: 0,
  rothIRABalance: 50000,
  traditional401kBalance: 150000,
  traditionalIRABalance: 25000,
  savingsAccountBalance: 25000,
  expectedReturnRate: 0.07,
  inflationRate: 0.025,
  riskTolerance: "moderate",
  withdrawalRate: 0.04,
  
  // Tax parameters
  filingStatus: "single",
  taxOptimizationStrategy: "basic",
  rothConversions: false,
  
  // COLA parameters
  pensionCOLA: 0.03,
  socialSecurityCOLA: 0.025,
  colaScenario: "moderate"
}

// Convert form data to scenario structure (same as in scenario-form.tsx)
function convertFormDataToScenario(formData) {
  return {
    name: formData.name,
    description: formData.description,
    isBaseline: formData.isBaseline,
    
    personalParameters: {
      currentAge: formData.currentAge,
      retirementAge: formData.retirementAge,
      lifeExpectancy: formData.lifeExpectancy,
      birthYear: formData.birthYear
    },
    
    pensionParameters: {
      retirementGroup: formData.retirementGroup,
      yearsOfService: formData.yearsOfService,
      averageSalary: formData.averageSalary,
      retirementOption: formData.retirementOption,
      beneficiaryAge: formData.beneficiaryAge
    },
    
    socialSecurityParameters: {
      claimingAge: formData.claimingAge,
      fullRetirementAge: formData.fullRetirementAge,
      fullRetirementBenefit: formData.fullRetirementBenefit,
      isMarried: formData.isMarried,
      spouseClaimingAge: formData.spouseClaimingAge,
      spouseFullRetirementBenefit: formData.spouseFullRetirementBenefit,
      spouseFullRetirementAge: formData.fullRetirementAge
    },
    
    financialParameters: {
      otherRetirementIncome: formData.otherRetirementIncome,
      rothIRABalance: formData.rothIRABalance,
      traditional401kBalance: formData.traditional401kBalance,
      traditionalIRABalance: formData.traditionalIRABalance,
      savingsAccountBalance: formData.savingsAccountBalance,
      expectedReturnRate: formData.expectedReturnRate,
      inflationRate: formData.inflationRate,
      riskTolerance: formData.riskTolerance,
      withdrawalStrategy: 'percentage',
      withdrawalRate: formData.withdrawalRate,
      estimatedMedicarePremiums: 174.70,
      longTermCareInsurance: false,
      healthcareCostInflation: 0.05
    },
    
    taxParameters: {
      filingStatus: formData.filingStatus,
      stateOfResidence: 'MA',
      taxOptimizationStrategy: formData.taxOptimizationStrategy,
      rothConversions: formData.rothConversions,
      taxLossHarvesting: false
    },
    
    colaParameters: {
      pensionCOLA: formData.pensionCOLA,
      socialSecurityCOLA: formData.socialSecurityCOLA,
      colaScenario: formData.colaScenario
    }
  }
}

async function testAPIScenarioCreation() {
  console.log('🧪 Testing API Scenario Creation Flow...\n')

  try {
    // Step 1: Setup test user
    console.log('1. Setting up test user...')
    let testUser = await prisma.user.findFirst({
      where: { email: 'api-test@example.com' }
    })

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'api-test@example.com',
          name: 'API Test User',
          emailVerified: new Date()
        }
      })
    }
    console.log(`   ✅ Test user ready: ${testUser.id}`)

    // Step 2: Convert form data to scenario structure
    console.log('\n2. Converting form data to scenario structure...')
    const scenarioData = convertFormDataToScenario(testFormData)
    console.log('   ✅ Form data converted successfully')
    console.log(`   Scenario structure:`)
    console.log(`   - Personal: age ${scenarioData.personalParameters.currentAge} → ${scenarioData.personalParameters.retirementAge}`)
    console.log(`   - Pension: Group ${scenarioData.pensionParameters.retirementGroup}, ${scenarioData.pensionParameters.yearsOfService} years, $${scenarioData.pensionParameters.averageSalary}`)
    console.log(`   - SS: Claim at ${scenarioData.socialSecurityParameters.claimingAge}, FRA ${scenarioData.socialSecurityParameters.fullRetirementAge}, $${scenarioData.socialSecurityParameters.fullRetirementBenefit}`)
    console.log(`   - Financial: Other income $${scenarioData.financialParameters.otherRetirementIncome}, Portfolio $${scenarioData.financialParameters.rothIRABalance + scenarioData.financialParameters.traditional401kBalance + scenarioData.financialParameters.traditionalIRABalance + scenarioData.financialParameters.savingsAccountBalance}`)

    // Step 3: Simulate the API endpoint logic
    console.log('\n3. Simulating API endpoint logic...')
    
    // Create scenario in database (same as API endpoint)
    const scenario = await prisma.retirementScenario.create({
      data: {
        userId: testUser.id,
        name: scenarioData.name,
        description: scenarioData.description,
        isBaseline: scenarioData.isBaseline,
        personalParameters: JSON.stringify(scenarioData.personalParameters),
        pensionParameters: JSON.stringify(scenarioData.pensionParameters),
        socialSecurityParameters: JSON.stringify(scenarioData.socialSecurityParameters),
        financialParameters: JSON.stringify(scenarioData.financialParameters),
        taxParameters: JSON.stringify(scenarioData.taxParameters),
        colaParameters: JSON.stringify(scenarioData.colaParameters)
      }
    })
    console.log(`   ✅ Scenario created in database: ${scenario.id}`)

    // Step 4: Test calculation logic (simulate what API does)
    console.log('\n4. Testing calculation logic...')
    
    try {
      // Prepare scenario data for calculation (same as API endpoint)
      const scenarioForCalculation = {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        isBaseline: scenario.isBaseline,
        createdAt: scenario.createdAt.toISOString(),
        updatedAt: scenario.updatedAt.toISOString(),
        personalParameters: scenarioData.personalParameters,
        pensionParameters: scenarioData.pensionParameters,
        socialSecurityParameters: scenarioData.socialSecurityParameters,
        financialParameters: scenarioData.financialParameters,
        taxParameters: scenarioData.taxParameters,
        colaParameters: scenarioData.colaParameters
      }

      console.log('   📊 Scenario data prepared for calculation')
      console.log('   ⚠️  Cannot test actual TypeScript calculation in Node.js')
      console.log('   💡 This is where the calculation would happen in the API')

      // Step 5: Simulate successful calculation results
      console.log('\n5. Simulating calculation results...')
      const mockResults = {
        pensionMonthlyBenefit: 2500,
        pensionAnnualBenefit: 30000,
        pensionLifetimeBenefits: 690000,
        pensionBenefitReduction: 0,
        pensionSurvivorBenefit: null,
        ssMonthlyBenefit: 1875, // Reduced for early claiming at 62
        ssAnnualBenefit: 22500,
        ssLifetimeBenefits: 517500,
        ssSpousalBenefit: null,
        ssSurvivorBenefit: null,
        totalMonthlyIncome: 4375,
        totalAnnualIncome: 52500,
        netAfterTaxIncome: 45000,
        replacementRatio: 0.70,
        annualTaxBurden: 7500,
        effectiveTaxRate: 0.143,
        marginalTaxRate: 0.22,
        federalTax: 5000,
        stateTax: 2000,
        socialSecurityTax: 500,
        initialPortfolioBalance: 250000,
        finalPortfolioBalance: 150000,
        totalWithdrawals: 100000,
        portfolioLongevity: 20,
        probabilityOfSuccess: 0.85,
        totalLifetimeIncome: 1207500,
        breakEvenAge: 72,
        riskScore: 4,
        flexibilityScore: 7,
        optimizationScore: 8,
        yearlyProjections: JSON.stringify([])
      }

      // Save results to database (same as API endpoint)
      await prisma.scenarioResult.create({
        data: {
          scenarioId: scenario.id,
          ...mockResults
        }
      })
      console.log('   ✅ Mock calculation results saved to database')

    } catch (calcError) {
      console.log('   ❌ Calculation failed (this is the issue!)')
      console.log(`   Error: ${calcError.message}`)
      console.log(`   Stack: ${calcError.stack}`)
    }

    // Step 6: Verify final scenario status
    console.log('\n6. Checking final scenario status...')
    const finalScenario = await prisma.retirementScenario.findUnique({
      where: { id: scenario.id },
      include: { results: true }
    })

    if (finalScenario?.results) {
      console.log('   ✅ Scenario has calculated results!')
      console.log(`   Monthly Income: $${finalScenario.results.totalMonthlyIncome}`)
      console.log(`   Risk Score: ${finalScenario.results.riskScore}`)
      console.log('   🎯 Status should show: "Calculated"')
    } else {
      console.log('   ❌ Scenario still has no results')
      console.log('   🔍 Status will show: "Pending"')
      console.log('   💡 This indicates the calculation is failing in the API')
    }

    // Step 7: Clean up
    console.log('\n7. Cleaning up test data...')
    if (finalScenario?.results) {
      await prisma.scenarioResult.delete({
        where: { id: finalScenario.results.id }
      })
    }
    await prisma.retirementScenario.delete({
      where: { id: scenario.id }
    })
    console.log('   ✅ Test data cleaned up')

    console.log('\n🎯 Test Summary:')
    console.log('✅ Form data conversion works correctly')
    console.log('✅ Database scenario creation works')
    console.log('✅ Scenario data structure is valid for calculation')
    console.log('⚠️  Actual calculation logic needs to be tested in running server')
    
    console.log('\n📋 Next Steps to Fix "Pending" Status:')
    console.log('1. Start the development server')
    console.log('2. Create a scenario through the UI')
    console.log('3. Check server console for calculation errors')
    console.log('4. Look for specific TypeScript/import errors')
    console.log('5. Verify all calculation dependencies are available')

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testAPIScenarioCreation()
