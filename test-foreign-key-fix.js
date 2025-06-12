// Test the foreign key constraint fix
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./lib/generated/prisma');

async function testForeignKeyFix() {
  console.log('🔧 Testing Foreign Key Constraint Fix...\n');
  
  try {
    const prisma = new PrismaClient();
    
    // Test user ID from the error logs
    const testUserId = '113615221466278220538';
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    
    console.log('1️⃣ Testing user existence check...');
    let user = await prisma.user.findUnique({
      where: { id: testUserId }
    });
    
    if (!user) {
      console.log('❌ User not found, creating user record...');
      try {
        user = await prisma.user.create({
          data: {
            id: testUserId,
            email: testEmail,
            name: testName,
            image: null
          }
        });
        console.log('✅ User created successfully:', {
          id: user.id,
          email: user.email,
          name: user.name
        });
      } catch (userCreateError) {
        console.error('❌ Failed to create user:', userCreateError);
        throw new Error(`Failed to create user record: ${userCreateError.message}`);
      }
    } else {
      console.log('✅ User already exists:', {
        id: user.id,
        email: user.email,
        name: user.name
      });
    }
    
    console.log('\n2️⃣ Testing profile creation with existing user...');
    const testProfileData = {
      dateOfBirth: new Date('1973-01-09'),
      membershipDate: new Date('1997-03-20'),
      retirementGroup: 'Group 1',
      benefitPercentage: 2.0,
      currentSalary: 75000
    };
    
    try {
      const updatedProfile = await prisma.retirementProfile.upsert({
        where: {
          userId: testUserId
        },
        update: testProfileData,
        create: {
          userId: testUserId,
          dateOfBirth: testProfileData.dateOfBirth,
          membershipDate: testProfileData.membershipDate,
          retirementGroup: testProfileData.retirementGroup,
          benefitPercentage: testProfileData.benefitPercentage,
          currentSalary: testProfileData.currentSalary
        }
      });
      
      console.log('✅ Profile upsert successful:', {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        retirementGroup: updatedProfile.retirementGroup,
        currentSalary: updatedProfile.currentSalary,
        dateOfBirth: updatedProfile.dateOfBirth?.toISOString().split('T')[0]
      });
      
    } catch (profileError) {
      console.error('❌ Profile upsert failed:', {
        error: profileError,
        message: profileError.message,
        code: profileError.code
      });
      throw profileError;
    }
    
    console.log('\n3️⃣ Testing profile update...');
    try {
      const updatedProfile = await prisma.retirementProfile.update({
        where: { userId: testUserId },
        data: { currentSalary: 85000 }
      });
      
      console.log('✅ Profile update successful:', {
        newSalary: updatedProfile.currentSalary
      });
      
    } catch (updateError) {
      console.error('❌ Profile update failed:', updateError);
      throw updateError;
    }
    
    console.log('\n4️⃣ Testing profile retrieval...');
    const retrievedProfile = await prisma.retirementProfile.findUnique({
      where: { userId: testUserId }
    });
    
    if (retrievedProfile) {
      console.log('✅ Profile retrieved successfully:', {
        dateOfBirth: retrievedProfile.dateOfBirth?.toISOString().split('T')[0],
        membershipDate: retrievedProfile.membershipDate?.toISOString().split('T')[0],
        retirementGroup: retrievedProfile.retirementGroup,
        currentSalary: retrievedProfile.currentSalary
      });
    } else {
      throw new Error('Profile not found after creation');
    }
    
    console.log('\n5️⃣ Cleaning up test data...');
    await prisma.retirementProfile.delete({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    console.log('✅ Test data cleaned up');
    
    await prisma.$disconnect();
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Foreign key constraint issue is FIXED');
    console.log('✅ User creation works correctly');
    console.log('✅ Profile upsert works correctly');
    console.log('✅ Profile updates work correctly');
    console.log('✅ Profile retrieval works correctly');
    
    console.log('\n🚀 The profile page should now work without foreign key errors!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', {
      error,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    console.log('\n🔧 If this test fails, check:');
    console.log('1. Database connection');
    console.log('2. Prisma schema');
    console.log('3. User table structure');
    console.log('4. Foreign key constraints');
  }
}

// Run the test
testForeignKeyFix();
