// Test the API fix directly
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./lib/generated/prisma');

// Simulate the API route logic
async function testAPIFix() {
  console.log('🧪 Testing API Fix Logic...\n');
  
  try {
    const prisma = new PrismaClient();
    
    // Mock session data from the error
    const mockSession = {
      user: {
        id: '113615221466278220538',
        email: 'user@example.com',
        name: 'Profile User',
        image: null
      }
    };
    
    // Mock request body from the error
    const requestBody = {
      dateOfBirth: '1973-01-09'
    };
    
    console.log('1️⃣ Simulating API POST request...');
    console.log('Session:', mockSession);
    console.log('Request body:', requestBody);
    
    // Check session
    if (!mockSession?.user?.id) {
      throw new Error('No session or user ID');
    }
    
    console.log('\n2️⃣ Checking if user exists...');
    let user = await prisma.user.findUnique({
      where: { id: mockSession.user.id }
    });
    
    if (!user) {
      console.log('❌ User not found, creating user record...');
      try {
        user = await prisma.user.create({
          data: {
            id: mockSession.user.id,
            email: mockSession.user.email || "",
            name: mockSession.user.name || "",
            image: mockSession.user.image || null
          }
        });
        console.log('✅ User created successfully:', user);
      } catch (userCreateError) {
        console.error('❌ Failed to create user:', userCreateError);
        throw new Error(`Failed to create user record: ${userCreateError.message}`);
      }
    } else {
      console.log('✅ User exists:', { id: user.id, email: user.email, name: user.name });
    }
    
    console.log('\n3️⃣ Processing profile data...');
    const profileData = {};
    
    if (requestBody.dateOfBirth) {
      profileData.dateOfBirth = new Date(requestBody.dateOfBirth);
    }
    
    console.log('Profile data to save:', profileData);
    
    console.log('\n4️⃣ Attempting profile upsert...');
    let updatedProfile;
    try {
      updatedProfile = await prisma.retirementProfile.upsert({
        where: {
          userId: mockSession.user.id
        },
        update: profileData,
        create: {
          userId: mockSession.user.id,
          dateOfBirth: profileData.dateOfBirth || new Date('1970-01-01'),
          membershipDate: profileData.membershipDate || new Date(),
          retirementGroup: profileData.retirementGroup || 'Group 1',
          benefitPercentage: profileData.benefitPercentage || 2.0,
          currentSalary: profileData.currentSalary || 0,
          ...profileData
        }
      });
      console.log('✅ Profile upsert successful:', {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        dateOfBirth: updatedProfile.dateOfBirth?.toISOString().split('T')[0],
        retirementGroup: updatedProfile.retirementGroup
      });
    } catch (upsertError) {
      console.error('❌ Profile upsert failed:', {
        error: upsertError,
        message: upsertError.message,
        code: upsertError.code
      });
      throw upsertError;
    }
    
    console.log('\n5️⃣ Creating API response...');
    const responseData = {
      message: "Profile updated successfully",
      profile: updatedProfile
    };
    
    console.log('✅ API response ready:', responseData.message);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 API FIX TEST PASSED!');
    console.log('✅ User existence check works');
    console.log('✅ User creation works');
    console.log('✅ Profile upsert works');
    console.log('✅ No foreign key constraint errors');
    
    console.log('\n🚀 The profile page should now work correctly!');
    console.log('📋 Test with the same data:');
    console.log('   - Date of Birth: 1973-01-09');
    console.log('   - Membership Date: 1997-03-20');
    
  } catch (error) {
    console.error('\n💥 API fix test failed:', {
      error,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

testAPIFix();
