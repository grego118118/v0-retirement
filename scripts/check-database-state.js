#!/usr/bin/env node

/**
 * Quick Database State Check
 * Determines current state of production database without Prisma client
 */

const { Client } = require('pg')

async function checkDatabaseState() {
  console.log('🔍 Checking Current Database State')
  console.log('=' .repeat(50))
  
  // Use direct PostgreSQL client to avoid Prisma connection issues
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.omiqpphkibfqddmwruuc:cwExuZuEgsZ29mXD@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
  })
  
  try {
    await client.connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    const tableQuery = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('User', 'Account', 'Session', 'RetirementProfile', 'RetirementCalculation', 'EmailLog')
      ORDER BY table_name
    `
    
    const result = await client.query(tableQuery)
    
    console.log('\n📋 Table Status:')
    const requiredTables = ['User', 'Account', 'Session', 'RetirementProfile', 'RetirementCalculation', 'EmailLog']
    const existingTables = result.rows.map(row => row.table_name)
    
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table)
      console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`)
    })
    
    // Check for any other tables
    const allTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    const allTables = await client.query(allTablesQuery)
    console.log(`\n📊 Total tables in database: ${allTables.rows.length}`)
    
    if (allTables.rows.length > 0) {
      console.log('All tables:')
      allTables.rows.forEach(row => {
        console.log(`   • ${row.table_name}`)
      })
    }
    
    // Test a simple query if User table exists
    if (existingTables.includes('User')) {
      try {
        const userCountResult = await client.query('SELECT COUNT(*) as count FROM "User"')
        console.log(`\n✅ User table query successful: ${userCountResult.rows[0].count} users`)
      } catch (error) {
        console.log(`\n❌ User table query failed: ${error.message}`)
      }
    }
    
    console.log('\n🎯 DIAGNOSIS:')
    if (existingTables.length === requiredTables.length) {
      console.log('✅ All required tables exist - this is a Prisma connection issue, not missing tables')
      console.log('🔧 Need to fix Prisma client connection pooling for Vercel serverless')
    } else {
      console.log(`❌ Missing ${requiredTables.length - existingTables.length} tables - need to run setup script`)
      console.log('📝 Run the production-setup.sql script in Supabase Dashboard')
    }
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`)
    console.log('\n🔧 Check:')
    console.log('   • DATABASE_URL environment variable')
    console.log('   • Supabase database is running')
    console.log('   • Network connectivity')
  } finally {
    await client.end()
  }
}

// Run check
checkDatabaseState().catch(console.error)
