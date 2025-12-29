/**
 * Test to verify database state and calculations for the authenticated user
 * This will help us understand why calculations aren't showing on the dashboard
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseState() {
  console.log('🗄️ Testing Database State and Calculations')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Check database connection
    console.log('\n📡 Step 1: Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test 2: Check if users exist
    console.log('\n👥 Step 2: Checking users in database...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`)
    })
    
    // Test 3: Check retirement calculations
    console.log('\n📊 Step 3: Checking retirement calculations...')
    const calculations = await prisma.retirementCalculation.findMany({
      select: {
        id: true,
        userId: true,
        calculationName: true,
        monthlyBenefit: true,
        annualBenefit: true,
        retirementGroup: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${calculations.length} total calculations:`)
    calculations.forEach(calc => {
      console.log(`  - ${calc.calculationName} (User: ${calc.userId}, Monthly: $${calc.monthlyBenefit})`)
    })
    
    // Test 4: Check calculations for specific user (from logs)
    const targetUserId = '113615221466278220538'
    console.log(`\n🎯 Step 4: Checking calculations for user ${targetUserId}...`)
    
    const userCalculations = await prisma.retirementCalculation.findMany({
      where: {
        userId: targetUserId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${userCalculations.length} calculations for this user:`)
    userCalculations.forEach(calc => {
      console.log(`  - ID: ${calc.id}`)
      console.log(`    Name: ${calc.calculationName}`)
      console.log(`    Monthly Benefit: $${calc.monthlyBenefit}`)
      console.log(`    Annual Benefit: $${calc.annualBenefit}`)
      console.log(`    Group: ${calc.retirementGroup}`)
      console.log(`    Created: ${calc.createdAt}`)
      console.log(`    Social Security Data: ${calc.socialSecurityData ? 'Yes' : 'No'}`)
      console.log('')
    })
    
    // Test 5: Check retirement profiles
    console.log('\n👤 Step 5: Checking retirement profiles...')
    const profiles = await prisma.retirementProfile.findMany({
      select: {
        id: true,
        userId: true,
        retirementGroup: true,
        currentSalary: true,
        yearsOfService: true,
        createdAt: true
      }
    })
    
    console.log(`Found ${profiles.length} retirement profiles:`)
    profiles.forEach(profile => {
      console.log(`  - User: ${profile.userId}, Group: ${profile.retirementGroup}, Salary: $${profile.currentSalary}`)
    })
    
    // Test 6: Test the exact query that the API uses
    console.log('\n🔍 Step 6: Testing API query simulation...')
    const apiSimulation = await prisma.retirementCalculation.findMany({
      where: {
        userId: targetUserId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('API simulation results:')
    console.log(`  - Count: ${apiSimulation.length}`)
    console.log(`  - Raw data structure:`, apiSimulation.map(calc => ({
      id: calc.id,
      calculationName: calc.calculationName,
      monthlyBenefit: calc.monthlyBenefit,
      socialSecurityData: calc.socialSecurityData ? 'Has data' : 'No data'
    })))
    
    // Test 7: Check if there are any data type issues
    console.log('\n🔬 Step 7: Checking for data type issues...')
    if (apiSimulation.length > 0) {
      const firstCalc = apiSimulation[0]
      console.log('First calculation detailed analysis:')
      console.log(`  - ID type: ${typeof firstCalc.id} (${firstCalc.id})`)
      console.log(`  - User ID type: ${typeof firstCalc.userId} (${firstCalc.userId})`)
      console.log(`  - Monthly benefit type: ${typeof firstCalc.monthlyBenefit} (${firstCalc.monthlyBenefit})`)
      console.log(`  - Created at type: ${typeof firstCalc.createdAt} (${firstCalc.createdAt})`)
      console.log(`  - Social Security data type: ${typeof firstCalc.socialSecurityData}`)
      
      if (firstCalc.socialSecurityData) {
        try {
          const parsed = JSON.parse(firstCalc.socialSecurityData)
          console.log(`  - Social Security data parsed successfully:`, Object.keys(parsed))
        } catch (error) {
          console.log(`  - Social Security data parse error:`, error.message)
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Database test error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function provideDatabaseDiagnosis() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 DATABASE DIAGNOSIS')
  console.log('='.repeat(60))
  
  console.log('\n📋 WHAT TO LOOK FOR:')
  console.log('1. ✅ Database connection working')
  console.log('2. ✅ User exists with ID: 113615221466278220538')
  console.log('3. ❓ Number of calculations for this user')
  console.log('4. ❓ Data structure and types are correct')
  console.log('5. ❓ Social Security data is properly formatted')
  
  console.log('\n🎯 EXPECTED RESULTS:')
  console.log('- If 0 calculations: User needs to create and save calculations')
  console.log('- If >0 calculations: Check data structure and API response format')
  console.log('- If data exists but dashboard empty: Frontend rendering issue')
  
  console.log('\n🔧 NEXT STEPS BASED ON RESULTS:')
  console.log('- 0 calculations: Test save functionality')
  console.log('- >0 calculations: Check API response format')
  console.log('- Data format issues: Fix data transformation')
  console.log('- All looks good: Check frontend useRetirementData hook')
}

// Run the database state test
testDatabaseState()
  .then(() => provideDatabaseDiagnosis())
  .catch(console.error)
