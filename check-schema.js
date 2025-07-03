const { PrismaClient } = require('./lib/generated/prisma');

async function checkDatabaseSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Massachusetts Retirement System - Database Schema Check');
    console.log('=' .repeat(60));
    
    // Check all tables that should exist according to schema.prisma
    const expectedTables = [
      'User', 'Account', 'Session', 'RetirementProfile', 
      'RetirementCalculation', 'EmailLog', 'NewsletterSubscriber'
    ];
    
    const results = {};
    
    for (const table of expectedTables) {
      try {
        const query = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        
        const columns = await prisma.$queryRawUnsafe(query);
        
        if (columns.length > 0) {
          results[table] = { exists: true, columns: columns.length };
          console.log(`✅ ${table}: ${columns.length} columns`);
        } else {
          results[table] = { exists: false };
          console.log(`❌ ${table}: Table missing`);
        }
      } catch (error) {
        results[table] = { exists: false, error: error.message };
        console.log(`❌ ${table}: Error - ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n📊 SCHEMA ANALYSIS');
    console.log('=' .repeat(60));
    
    const existingTables = Object.values(results).filter(r => r.exists).length;
    const missingTables = Object.keys(results).filter(table => !results[table].exists);
    
    console.log(`Tables Found: ${existingTables}/${expectedTables.length}`);
    
    if (missingTables.length > 0) {
      console.log(`\n🚨 MISSING TABLES (${missingTables.length}):`);
      missingTables.forEach(table => {
        console.log(`   ❌ ${table}`);
      });
      
      console.log('\n💡 MIGRATION NEEDED:');
      console.log('   The NewsletterSubscriber table is missing from production.');
      console.log('   This table was added to schema.prisma but not deployed.');
      console.log('\n🔧 SOLUTION:');
      console.log('   1. Run: npx prisma db push');
      console.log('   2. Or add NewsletterSubscriber to production-setup.sql');
    } else {
      console.log('\n✅ ALL TABLES EXIST - No migration needed');
    }
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseSchema();
