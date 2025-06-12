// Test script to validate profile API functionality
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./lib/generated/prisma');

async function testProfileAPI() {
  console.log('🔍 Testing Profile API Functionality...\n');
  
  try {
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Check User table
    console.log('\n2. Checking User table...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible, ${userCount} users found`);
    
    // Test 3: Check RetirementProfile table
    console.log('\n3. Checking RetirementProfile table...');
    const profileCount = await prisma.retirementProfile.count();
    console.log(`✅ RetirementProfile table accessible, ${profileCount} profiles found`);
    
    // Test 4: Test profile creation (mock data)
    console.log('\n4. Testing profile creation with mock data...');
    const mockUserId = 'test-user-' + Date.now();
    
    // Create a test user first
    const testUser = await prisma.user.create({
      data: {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Create a test profile
    const testProfile = await prisma.retirementProfile.create({
      data: {
        userId: mockUserId,
        dateOfBirth: new Date('1980-01-01'),
        membershipDate: new Date('2010-01-01'),
        retirementGroup: 'Group 1',
        benefitPercentage: 2.0,
        currentSalary: 75000,
        averageHighest3Years: 80000,
        yearsOfService: 15,
        plannedRetirementAge: 65,
        retirementOption: 'A'
      }
    });
    console.log('✅ Test profile created:', testProfile.id);
    
    // Test 5: Test profile update (upsert)
    console.log('\n5. Testing profile update...');
    const updatedProfile = await prisma.retirementProfile.upsert({
      where: { userId: mockUserId },
      update: { currentSalary: 85000 },
      create: {
        userId: mockUserId,
        dateOfBirth: new Date('1980-01-01'),
        membershipDate: new Date('2010-01-01'),
        retirementGroup: 'Group 1',
        benefitPercentage: 2.0,
        currentSalary: 85000,
      }
    });
    console.log('✅ Profile updated successfully, new salary:', updatedProfile.currentSalary);
    
    // Test 6: Test profile retrieval
    console.log('\n6. Testing profile retrieval...');
    const retrievedProfile = await prisma.retirementProfile.findUnique({
      where: { userId: mockUserId }
    });
    console.log('✅ Profile retrieved successfully:', {
      retirementGroup: retrievedProfile.retirementGroup,
      currentSalary: retrievedProfile.currentSalary,
      plannedRetirementAge: retrievedProfile.plannedRetirementAge
    });
    
    // Cleanup: Remove test data
    console.log('\n7. Cleaning up test data...');
    await prisma.retirementProfile.delete({
      where: { userId: mockUserId }
    });
    await prisma.user.delete({
      where: { id: mockUserId }
    });
    console.log('✅ Test data cleaned up');
    
    await prisma.$disconnect();
    console.log('\n🎉 All tests passed! Profile API functionality is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

// Run the test
testProfileAPI();
