/**
 * Test script to verify scenario calculation fixes
 * This script tests the updated scenario calculation logic
 */

const { PrismaClient } = require('./lib/generated/prisma')

const prisma = new PrismaClient()

// Mock scenario data that matches the actual form structure
const mockScenarioData = {
  name: "Test Scenario - Calculation Fix",
  description: "Testing updated scenario calculation logic",
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

async function testCalculationFix() {
  console.log('🔧 Testing Scenario Calculation Fixes...\n')

  try {
    // Step 1: Check if we have a test user
    console.log('1. Checking for test user...')
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('   Creating test user...')
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: new Date()
        }
      })
    }
    console.log(`   ✅ Test user found/created: ${testUser.id}`)

    // Step 2: Test the API endpoint directly
    console.log('\n2. Testing API endpoint with scenario creation...')
    
    const apiUrl = 'http://localhost:3000/api/scenarios'
    console.log(`   Making POST request to: ${apiUrl}`)
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `next-auth.session-token=test-session-${testUser.id}` // Mock session
        },
        body: JSON.stringify(mockScenarioData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('   ✅ API request successful')
        console.log(`   Scenario ID: ${data.scenario.id}`)
        console.log(`   Has Results: ${!!data.scenario.results}`)
        
        if (data.scenario.results) {
          console.log(`   Monthly Income: $${data.scenario.results.totalMonthlyIncome}`)
          console.log(`   Risk Score: ${data.scenario.results.riskScore}`)
          console.log('   ✅ Scenario has calculated results!')
        } else {
          console.log('   ⚠️  Scenario still pending - check server logs for calculation errors')
        }
      } else {
        console.log(`   ❌ API request failed: ${response.status} ${response.statusText}`)
        const errorData = await response.text()
        console.log(`   Error: ${errorData}`)
      }
    } catch (fetchError) {
      console.log('   ⚠️  Cannot test API endpoint (server not running)')
      console.log(`   Error: ${fetchError.message}`)
      console.log('   Proceeding with direct calculation test...')
    }

    // Step 3: Test calculation logic directly (if we can import it)
    console.log('\n3. Testing calculation logic directly...')
    
    try {
      // Try to import and test the calculation function
      // Note: This requires the TypeScript to be compiled or using ts-node
      console.log('   ⚠️  Direct calculation test requires TypeScript compilation')
      console.log('   Recommendation: Start the dev server and test via API')
    } catch (importError) {
      console.log('   ⚠️  Cannot import TypeScript modules directly')
      console.log('   This is expected in a Node.js environment')
    }

    // Step 4: Check database for any existing scenarios
    console.log('\n4. Checking existing scenarios in database...')
    const existingScenarios = await prisma.retirementScenario.findMany({
      where: { userId: testUser.id },
      include: { results: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log(`   Found ${existingScenarios.length} existing scenarios`)
    
    existingScenarios.forEach((scenario, index) => {
      console.log(`   ${index + 1}. ${scenario.name}`)
      console.log(`      Created: ${scenario.createdAt.toISOString()}`)
      console.log(`      Has Results: ${!!scenario.results}`)
      if (scenario.results) {
        console.log(`      Monthly Income: $${scenario.results.totalMonthlyIncome}`)
        console.log(`      Status: Calculated ✅`)
      } else {
        console.log(`      Status: Pending ⏳`)
      }
    })

    console.log('\n🎯 Test Summary:')
    console.log('- Updated calculation logic to handle missing Social Security benefit calculations')
    console.log('- Added default values for missing financial parameters')
    console.log('- Improved error handling and logging')
    console.log('- Fixed portfolio analysis calculations')
    console.log('\n📋 Next Steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Navigate to /scenarios page')
    console.log('3. Create a new scenario and verify it shows "Calculated" status')
    console.log('4. Check browser console and server logs for any remaining errors')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testCalculationFix()
