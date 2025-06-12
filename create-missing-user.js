// Create the missing user record for the failing session
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./lib/generated/prisma');

async function createMissingUser() {
  console.log('🔧 Creating missing user record...\n');
  
  try {
    const prisma = new PrismaClient();
    
    // The actual user ID from the error logs
    const userId = '113615221466278220538';
    
    console.log('Checking if user exists:', userId);
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('Creating user record...');
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'user@example.com', // Placeholder email
          name: 'Profile User',       // Placeholder name
          image: null
        }
      });
      console.log('✅ User created:', user);
    } else {
      console.log('✅ User already exists:', user);
    }
    
    await prisma.$disconnect();
    console.log('\n🎉 User record is ready for profile operations!');
    
  } catch (error) {
    console.error('❌ Failed to create user:', error);
  }
}

createMissingUser();
