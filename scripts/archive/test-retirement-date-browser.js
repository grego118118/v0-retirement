// Browser console test for retirement date data flow
// Copy and paste this into the browser console on the profile page

async function testRetirementDateFlow() {
  console.log('🧪 Testing Retirement Date Data Flow in Browser...\n');

  // Test data
  const testRetirementDate = '2030-06-15'; // Future date
  const testProfileData = {
    retirementDate: testRetirementDate,
    dateOfBirth: '1980-01-01',
    membershipDate: '2010-01-01',
    retirementGroup: 'Group 1',
    currentSalary: 75000,
    plannedRetirementAge: 50
  };

  try {
    // Step 1: Test Profile API POST (save retirement date)
    console.log('📤 Step 1: Testing profile save with retirement date...');
    const saveResponse = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProfileData)
    });

    if (!saveResponse.ok) {
      console.error('❌ Profile save failed:', saveResponse.status, saveResponse.statusText);
      const errorText = await saveResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const saveResult = await saveResponse.json();
    console.log('✅ Profile saved successfully');
    console.log('📊 Save response:', saveResult);

    // Step 2: Test Profile API GET (retrieve retirement date)
    console.log('\n📥 Step 2: Testing profile retrieval...');
    const getResponse = await fetch('/api/profile');

    if (!getResponse.ok) {
      console.error('❌ Profile retrieval failed:', getResponse.status, getResponse.statusText);
      return;
    }

    const getResult = await getResponse.json();
    console.log('✅ Profile retrieved successfully');
    console.log('📊 Retrieved data:', getResult);

    // Step 3: Verify retirement date consistency
    console.log('\n🔍 Step 3: Verifying data consistency...');
    
    if (getResult.retirementDate === testRetirementDate) {
      console.log('✅ Retirement date matches! Input:', testRetirementDate, 'Output:', getResult.retirementDate);
    } else {
      console.log('❌ Retirement date mismatch! Input:', testRetirementDate, 'Output:', getResult.retirementDate);
    }

    // Step 4: Test form field update
    console.log('\n📝 Step 4: Testing form field update...');
    const retirementDateInput = document.getElementById('plannedRetirementDate');
    if (retirementDateInput) {
      retirementDateInput.value = testRetirementDate;
      retirementDateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Form field updated with test date');
    } else {
      console.log('❌ Could not find retirement date input field');
    }

    // Step 5: Simulate dashboard date calculation
    console.log('\n📊 Step 5: Testing dashboard date calculation logic...');
    
    const simulateGetRetirementDate = (profile) => {
      // Priority 1: Use user-selected planned retirement date if available
      if (profile?.retirementDate) {
        const plannedDate = new Date(profile.retirementDate + 'T00:00:00');
        if (plannedDate > new Date()) {
          return plannedDate;
        }
      }

      // Priority 2: Calculate based on profile data if available
      if (profile?.dateOfBirth && profile?.plannedRetirementAge) {
        const birthDate = new Date(profile.dateOfBirth);
        const retirementYear = birthDate.getFullYear() + profile.plannedRetirementAge;
        const retirementDate = new Date(retirementYear, 0, 1);
        return retirementDate;
      }

      // Default fallback
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 5);
      return defaultDate;
    };

    const calculatedDate = simulateGetRetirementDate(getResult);
    console.log('🎯 Dashboard would use date:', calculatedDate.toISOString().split('T')[0]);
    console.log('🎯 Expected date:', testRetirementDate);

    if (calculatedDate.toISOString().split('T')[0] === testRetirementDate) {
      console.log('✅ Dashboard calculation is correct!');
    } else {
      console.log('❌ Dashboard calculation is incorrect!');
    }

    console.log('\n🎉 Test completed! Check the dashboard page to verify the countdown shows the correct date.');
    console.log('🔗 Navigate to: /dashboard');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Auto-run the test
console.log('🚀 Starting retirement date flow test...');
testRetirementDateFlow();
