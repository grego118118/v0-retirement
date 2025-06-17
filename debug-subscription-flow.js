/**
 * Debug script for subscription flow
 * This script helps debug the subscription status update flow
 */

const { PrismaClient } = require('@prisma/client');

async function debugSubscriptionFlow() {
  console.log('🔍 Starting subscription flow debug...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Step 1: Check current users in database
    console.log('📋 Step 1: Checking current users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        stripeCustomerId: true,
        subscriptionId: true,
        currentPeriodEnd: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`📊 Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📛 Name: ${user.name || 'N/A'}`);
      console.log(`   📊 Status: ${user.subscriptionStatus || 'N/A'}`);
      console.log(`   📦 Plan: ${user.subscriptionPlan || 'N/A'}`);
      console.log(`   🆔 Customer ID: ${user.stripeCustomerId || 'N/A'}`);
      console.log(`   🔗 Subscription ID: ${user.subscriptionId || 'N/A'}`);
      console.log(`   📅 Period End: ${user.currentPeriodEnd ? user.currentPeriodEnd.toISOString() : 'N/A'}`);
      console.log(`   🕐 Created: ${user.createdAt.toISOString()}`);
      console.log(`   🕐 Updated: ${user.updatedAt.toISOString()}`);
    });

    // Step 2: Test subscription type logic for each user
    console.log('\n📋 Step 2: Testing subscription type logic for each user...');
    
    // Import the function (this would need to be adjusted for actual import)
    const getUserSubscriptionType = (user) => {
      // Replicate the logic from lib/stripe/config.ts
      if (user.subscriptionStatus === 'active' && user.subscriptionPlan) {
        if (user.stripeCustomerId && user.stripeCustomerId.startsWith('cus_')) {
          return user.subscriptionPlan === 'monthly' ? 'stripe_monthly' : 'stripe_annual';
        }
        
        if (!user.stripeCustomerId || user.stripeCustomerId.startsWith('demo_')) {
          return user.subscriptionPlan === 'monthly' ? 'stripe_monthly' : 'stripe_annual';
        }
        
        if (user.stripeCustomerId) {
          return user.subscriptionPlan === 'monthly' ? 'stripe_monthly' : 'stripe_annual';
        }
      }
      
      const hybridModelLaunchDate = new Date('2024-12-01');
      const userCreatedAt = new Date(user.createdAt);
      
      if (userCreatedAt < hybridModelLaunchDate) {
        return 'oauth_premium';
      }
      
      return 'oauth_free';
    };

    const isUserPremium = (userType) => {
      const USER_TYPES = {
        oauth_free: { isPremium: false },
        oauth_premium: { isPremium: true },
        stripe_monthly: { isPremium: true },
        stripe_annual: { isPremium: true }
      };
      return USER_TYPES[userType]?.isPremium || false;
    };

    users.forEach((user, index) => {
      const userType = getUserSubscriptionType(user);
      const isPremium = isUserPremium(userType);
      
      console.log(`\n🧪 User ${index + 1} Analysis:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏷️  Subscription Type: ${userType}`);
      console.log(`   ⭐ Is Premium: ${isPremium ? 'YES' : 'NO'}`);
      console.log(`   📊 Logic Path: ${getLogicPath(user)}`);
    });

    // Step 3: Simulate demo checkout for a test user
    console.log('\n📋 Step 3: Simulating demo checkout...');
    
    const testEmail = 'test-demo@example.com';
    const planType = 'monthly';
    
    console.log(`📧 Test user email: ${testEmail}`);
    console.log(`📦 Plan type: ${planType}`);
    
    // Check if test user exists
    let testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (testUser) {
      console.log('👤 Test user already exists, updating...');
    } else {
      console.log('👤 Creating new test user...');
    }
    
    // Generate demo IDs
    const demoCustomerId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const demoSubscriptionId = `demo_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userData = {
      email: testEmail,
      name: 'Demo Test User',
      subscriptionStatus: 'active',
      subscriptionPlan: planType,
      stripeCustomerId: demoCustomerId,
      subscriptionId: demoSubscriptionId,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
    };
    
    if (testUser) {
      testUser = await prisma.user.update({
        where: { email: testEmail },
        data: userData
      });
    } else {
      testUser = await prisma.user.create({
        data: userData
      });
    }
    
    console.log('✅ Demo subscription created/updated successfully');
    console.log(`📊 Updated user data:`, JSON.stringify({
      email: testUser.email,
      subscriptionStatus: testUser.subscriptionStatus,
      subscriptionPlan: testUser.subscriptionPlan,
      stripeCustomerId: testUser.stripeCustomerId,
      subscriptionId: testUser.subscriptionId
    }, null, 2));
    
    // Test the subscription type for the demo user
    const demoUserType = getUserSubscriptionType(testUser);
    const demoIsPremium = isUserPremium(demoUserType);
    
    console.log(`\n🧪 Demo User Analysis:`);
    console.log(`   🏷️  Subscription Type: ${demoUserType}`);
    console.log(`   ⭐ Is Premium: ${demoIsPremium ? 'YES' : 'NO'}`);
    console.log(`   📊 Logic Path: ${getLogicPath(testUser)}`);
    
    if (demoIsPremium) {
      console.log('✅ Demo subscription should grant premium access');
    } else {
      console.log('❌ Demo subscription is not granting premium access - ISSUE FOUND');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getLogicPath(user) {
  if (user.subscriptionStatus === 'active' && user.subscriptionPlan) {
    if (user.stripeCustomerId && user.stripeCustomerId.startsWith('cus_')) {
      return 'Real Stripe subscription';
    }
    if (!user.stripeCustomerId || user.stripeCustomerId.startsWith('demo_')) {
      return 'Demo subscription';
    }
    if (user.stripeCustomerId) {
      return 'Other active subscription';
    }
  }
  
  const hybridModelLaunchDate = new Date('2024-12-01');
  const userCreatedAt = new Date(user.createdAt);
  
  if (userCreatedAt < hybridModelLaunchDate) {
    return 'Grandfathered OAuth premium';
  }
  
  return 'Free tier user';
}

// Run debug if this script is executed directly
if (require.main === module) {
  debugSubscriptionFlow().catch(console.error);
}

module.exports = {
  debugSubscriptionFlow
};
