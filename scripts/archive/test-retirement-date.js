// Test script to verify retirement date data flow
// This script tests the complete flow: profile form → database → dashboard

const testRetirementDateFlow = async () => {
  console.log('🧪 Testing Retirement Date Data Flow...\n')

  // Test data
  const testRetirementDate = '2030-06-15' // Future date
  const testProfileData = {
    fullName: 'Test User',
    retirementDate: testRetirementDate,
    dateOfBirth: '1980-01-01',
    membershipDate: '2010-01-01',
    retirementGroup: 'Group 1',
    currentSalary: 75000,
    plannedRetirementAge: 50
  }

  try {
    // Step 1: Test Profile API POST (save retirement date)
    console.log('📤 Step 1: Testing profile save with retirement date...')
    const saveResponse = await fetch('http://localhost:3000/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProfileData)
    })

    if (!saveResponse.ok) {
      console.error('❌ Profile save failed:', saveResponse.status, saveResponse.statusText)
      return
    }

    const saveResult = await saveResponse.json()
    console.log('✅ Profile saved successfully')
    console.log('📊 Save response:', JSON.stringify(saveResult, null, 2))

    // Step 2: Test Profile API GET (retrieve retirement date)
    console.log('\n📥 Step 2: Testing profile retrieval...')
    const getResponse = await fetch('http://localhost:3000/api/profile')

    if (!getResponse.ok) {
      console.error('❌ Profile retrieval failed:', getResponse.status, getResponse.statusText)
      return
    }

    const getResult = await getResponse.json()
    console.log('✅ Profile retrieved successfully')
    console.log('📊 Retrieved data:', JSON.stringify(getResult, null, 2))

    // Step 3: Verify retirement date consistency
    console.log('\n🔍 Step 3: Verifying data consistency...')
    
    if (getResult.retirementDate === testRetirementDate) {
      console.log('✅ Retirement date matches! Input:', testRetirementDate, 'Output:', getResult.retirementDate)
    } else {
      console.log('❌ Retirement date mismatch! Input:', testRetirementDate, 'Output:', getResult.retirementDate)
    }

    // Step 4: Test dashboard date calculation
    console.log('\n📊 Step 4: Testing dashboard date calculation logic...')
    
    // Simulate dashboard getRetirementDate() logic
    const simulateGetRetirementDate = (profile) => {
      // Priority 1: Use user-selected planned retirement date if available
      if (profile?.retirementDate) {
        const plannedDate = new Date(profile.retirementDate + 'T00:00:00')
        if (plannedDate > new Date()) {
          return plannedDate
        }
      }

      // Priority 2: Calculate based on profile data if available
      if (profile?.dateOfBirth && profile?.plannedRetirementAge) {
        const birthDate = new Date(profile.dateOfBirth)
        const retirementYear = birthDate.getFullYear() + profile.plannedRetirementAge
        const retirementDate = new Date(retirementYear, 0, 1)
        return retirementDate
      }

      // Default fallback
      const defaultDate = new Date()
      defaultDate.setFullYear(defaultDate.getFullYear() + 5)
      return defaultDate
    }

    const calculatedDate = simulateGetRetirementDate(getResult)
    console.log('🎯 Dashboard would use date:', calculatedDate.toISOString().split('T')[0])
    console.log('🎯 Expected date:', testRetirementDate)

    if (calculatedDate.toISOString().split('T')[0] === testRetirementDate) {
      console.log('✅ Dashboard calculation is correct!')
    } else {
      console.log('❌ Dashboard calculation is incorrect!')
    }

    console.log('\n🎉 Test completed!')

  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

// Run the test
testRetirementDateFlow()
