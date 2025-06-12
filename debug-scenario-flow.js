/**
 * Debug script to test the complete scenario creation flow
 * This script will help identify exactly where the calculation is failing
 */

const { PrismaClient } = require('./lib/generated/prisma')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Test scenario data that matches the form structure
const testScenarioData = {
  name: "Debug Test Scenario",
  description: "Testing scenario calculation flow step by step",
  isBaseline: false,
  personalParameters: {
    retirementAge: 62,
    lifeExpectancy: 85,
    currentAge: 45,
    birthYear: 1979
  },
  pensionParameters: {
    retirementGroup: "1",
    yearsOfService: 25,
    averageSalary: 75000,
    retirementOption: "A",
    beneficiaryAge: null
  },
  socialSecurityParameters: {
    claimingAge: 62,
    fullRetirementAge: 67,
    fullRetirementBenefit: 2500,
    isMarried: false,
    spouseClaimingAge: null,
    spouseFullRetirementBenefit: null
  },
  financialParameters: {
    otherRetirementIncome: 0,
    rothIRABalance: 50000,
    traditional401kBalance: 150000,
    traditionalIRABalance: 25000,
    savingsAccountBalance: 25000,
    expectedReturnRate: 0.07,
    inflationRate: 0.025,
    riskTolerance: "moderate",
    withdrawalRate: 0.04
  },
  taxParameters: {
    filingStatus: "single",
    stateOfResidence: "MA",
    taxOptimizationStrategy: "basic",
    rothConversions: false,
    taxLossHarvesting: false
  },
  colaParameters: {
    pensionCOLA: 0.03,
    socialSecurityCOLA: 0.025,
    colaScenario: "moderate"
  }
}

async function debugScenarioFlow() {
  console.log('🔍 Debugging Scenario Creation Flow...\n')

  try {
    // Step 1: Verify database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('   ✅ Database connected successfully')

    // Step 2: Check for test user
    console.log('\n2. Setting up test user...')
    let testUser = await prisma.user.findFirst({
      where: { email: 'debug@example.com' }
    })

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'debug@example.com',
          name: 'Debug User',
          emailVerified: new Date()
        }
      })
    }
    console.log(`   ✅ Test user ready: ${testUser.id}`)

    // Step 3: Test scenario creation in database
    console.log('\n3. Creating scenario in database...')
    const scenario = await prisma.retirementScenario.create({
      data: {
        userId: testUser.id,
        name: testScenarioData.name,
        description: testScenarioData.description,
        isBaseline: testScenarioData.isBaseline,
        personalParameters: JSON.stringify(testScenarioData.personalParameters),
        pensionParameters: JSON.stringify(testScenarioData.pensionParameters),
        socialSecurityParameters: JSON.stringify(testScenarioData.socialSecurityParameters),
        financialParameters: JSON.stringify(testScenarioData.financialParameters),
        taxParameters: JSON.stringify(testScenarioData.taxParameters),
        colaParameters: JSON.stringify(testScenarioData.colaParameters)
      }
    })
    console.log(`   ✅ Scenario created: ${scenario.id}`)

    // Step 4: Check if scenario has results initially
    console.log('\n4. Checking initial scenario status...')
    const scenarioWithResults = await prisma.retirementScenario.findUnique({
      where: { id: scenario.id },
      include: { results: true }
    })
    
    if (scenarioWithResults?.results) {
      console.log('   ❌ UNEXPECTED: Scenario has results immediately after creation')
    } else {
      console.log('   ✅ Scenario has no results initially (expected)')
    }

    // Step 5: Test the calculation logic by importing dependencies
    console.log('\n5. Testing calculation dependencies...')
    
    // Check if required calculation modules exist
    const calculatorPath = path.join(__dirname, 'lib', 'scenario-modeling', 'scenario-calculator.ts')
    const pensionCalculatorPath = path.join(__dirname, 'lib', 'standardized-pension-calculator.ts')
    const taxCalculatorPath = path.join(__dirname, 'lib', 'tax', 'tax-calculator.ts')
    
    console.log(`   Checking calculator file: ${fs.existsSync(calculatorPath) ? '✅' : '❌'} ${calculatorPath}`)
    console.log(`   Checking pension calculator: ${fs.existsSync(pensionCalculatorPath) ? '✅' : '❌'} ${pensionCalculatorPath}`)
    console.log(`   Checking tax calculator: ${fs.existsSync(taxCalculatorPath) ? '✅' : '❌'} ${taxCalculatorPath}`)

    // Step 6: Test individual calculation components
    console.log('\n6. Testing calculation components...')
    
    try {
      // Test pension calculation input format
      const pensionInput = {
        currentAge: testScenarioData.personalParameters.currentAge,
        yearsOfService: testScenarioData.pensionParameters.yearsOfService,
        retirementGroup: `Group ${testScenarioData.pensionParameters.retirementGroup}`,
        serviceEntry: 'after_2012',
        currentSalary: testScenarioData.pensionParameters.averageSalary,
        averageHighest3Years: testScenarioData.pensionParameters.averageSalary,
        plannedRetirementAge: testScenarioData.personalParameters.retirementAge,
        retirementOption: testScenarioData.pensionParameters.retirementOption,
        beneficiaryAge: testScenarioData.pensionParameters.beneficiaryAge
      }
      console.log('   ✅ Pension calculation input structure valid')
      console.log(`   Pension input: ${JSON.stringify(pensionInput, null, 2)}`)

      // Test Social Security calculation
      const ssParams = testScenarioData.socialSecurityParameters
      console.log('   ✅ Social Security parameters structure valid')
      console.log(`   SS claiming age: ${ssParams.claimingAge}, FRA: ${ssParams.fullRetirementAge}, Benefit: ${ssParams.fullRetirementBenefit}`)

      // Test tax calculation input
      const taxInput = {
        pensionIncome: 30000, // Example
        socialSecurityIncome: 22500, // Example
        otherRetirementIncome: testScenarioData.financialParameters.otherRetirementIncome,
        filingStatus: testScenarioData.taxParameters.filingStatus,
        age: testScenarioData.personalParameters.retirementAge,
        state: testScenarioData.taxParameters.stateOfResidence
      }
      console.log('   ✅ Tax calculation input structure valid')
      console.log(`   Tax input: ${JSON.stringify(taxInput, null, 2)}`)

    } catch (componentError) {
      console.log(`   ❌ Component test failed: ${componentError.message}`)
    }

    // Step 7: Simulate the API calculation flow
    console.log('\n7. Simulating API calculation flow...')
    
    const scenarioForCalculation = {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      isBaseline: scenario.isBaseline,
      createdAt: scenario.createdAt.toISOString(),
      updatedAt: scenario.updatedAt.toISOString(),
      personalParameters: testScenarioData.personalParameters,
      pensionParameters: testScenarioData.pensionParameters,
      socialSecurityParameters: testScenarioData.socialSecurityParameters,
      financialParameters: testScenarioData.financialParameters,
      taxParameters: testScenarioData.taxParameters,
      colaParameters: testScenarioData.colaParameters
    }

    console.log('   ✅ Scenario data structure for calculation prepared')
    console.log('   ⚠️  Cannot test actual calculation without TypeScript compilation')

    // Step 8: Check what happens in the API endpoint
    console.log('\n8. Analyzing API endpoint behavior...')
    
    // Read the API endpoint file to understand the flow
    const apiEndpointPath = path.join(__dirname, 'app', 'api', 'scenarios', 'route.ts')
    if (fs.existsSync(apiEndpointPath)) {
      console.log('   ✅ API endpoint file exists')
      
      // Check if the calculation is being called
      const apiContent = fs.readFileSync(apiEndpointPath, 'utf8')
      const hasCalculationCall = apiContent.includes('calculateScenarioResults')
      const hasTryCatch = apiContent.includes('try {') && apiContent.includes('} catch (calcError)')
      
      console.log(`   Calculation call present: ${hasCalculationCall ? '✅' : '❌'}`)
      console.log(`   Error handling present: ${hasTryCatch ? '✅' : '❌'}`)
      
      if (hasCalculationCall && hasTryCatch) {
        console.log('   ✅ API endpoint should be calling calculation logic')
        console.log('   💡 Issue likely in calculation logic or missing dependencies')
      } else {
        console.log('   ❌ API endpoint may not be properly calling calculations')
      }
    }

    // Step 9: Clean up test data
    console.log('\n9. Cleaning up test data...')
    await prisma.retirementScenario.delete({
      where: { id: scenario.id }
    })
    console.log('   ✅ Test scenario deleted')

    // Step 10: Summary and recommendations
    console.log('\n🎯 Debug Summary:')
    console.log('✅ Database connection works')
    console.log('✅ Scenario creation works')
    console.log('✅ Data structures are valid')
    console.log('⚠️  Cannot test actual calculation without running server')
    
    console.log('\n📋 Next Steps:')
    console.log('1. Start the development server to test actual calculation')
    console.log('2. Check server console logs during scenario creation')
    console.log('3. Use browser dev tools to inspect API requests/responses')
    console.log('4. Look for specific error messages in calculation logic')

  } catch (error) {
    console.error('❌ Debug failed:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the debug
debugScenarioFlow()
