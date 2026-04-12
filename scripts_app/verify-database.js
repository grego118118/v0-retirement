#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks if all required tables exist in the production database
 */

const { PrismaClient } = require('../lib/generated/prisma')

async function verifyDatabase() {
  const prisma = new PrismaClient()
  
  console.log('🔍 Massachusetts Retirement System - Database Verification')
  console.log('=' .repeat(60))
  
  const requiredTables = [
    'User',
    'Account', 
    'Session',
    'RetirementProfile',
    'RetirementCalculation',
    'EmailLog'
  ]
  
  const results = {
    connected: false,
    tablesExist: {},
    totalTables: 0,
    missingTables: [],
    errors: []
  }
  
  try {
    // Test basic connectivity
    console.log('📡 Testing database connectivity...')
    await prisma.$queryRaw`SELECT 1 as test`
    results.connected = true
    console.log('✅ Database connection successful')
    
    // Check each required table
    console.log('\n📋 Checking required tables...')
    
    for (const table of requiredTables) {
      try {
        // Try to query the table structure
        const query = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `
        
        const columns = await prisma.$queryRawUnsafe(query)
        
        if (columns.length > 0) {
          results.tablesExist[table] = {
            exists: true,
            columns: columns.length,
            details: columns
          }
          console.log(`✅ ${table}: ${columns.length} columns`)
        } else {
          results.tablesExist[table] = { exists: false }
          results.missingTables.push(table)
          console.log(`❌ ${table}: Table not found`)
        }
      } catch (error) {
        results.tablesExist[table] = { 
          exists: false, 
          error: error.message 
        }
        results.missingTables.push(table)
        results.errors.push(`${table}: ${error.message}`)
        console.log(`❌ ${table}: Error - ${error.message}`)
      }
    }
    
    // Test table operations
    console.log('\n🧪 Testing table operations...')
    
    if (results.tablesExist.User?.exists) {
      try {
        const userCount = await prisma.user.count()
        console.log(`✅ User table: ${userCount} records`)
      } catch (error) {
        console.log(`⚠️  User table: Query failed - ${error.message}`)
        results.errors.push(`User query: ${error.message}`)
      }
    }
    
    if (results.tablesExist.RetirementProfile?.exists) {
      try {
        const profileCount = await prisma.retirementProfile.count()
        console.log(`✅ RetirementProfile table: ${profileCount} records`)
      } catch (error) {
        console.log(`⚠️  RetirementProfile table: Query failed - ${error.message}`)
        results.errors.push(`RetirementProfile query: ${error.message}`)
      }
    }
    
  } catch (error) {
    results.connected = false
    results.errors.push(`Connection: ${error.message}`)
    console.log(`❌ Database connection failed: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY')
  console.log('=' .repeat(60))
  
  const existingTables = Object.values(results.tablesExist).filter(t => t.exists).length
  const totalRequired = requiredTables.length
  
  console.log(`Database Connected: ${results.connected ? '✅ Yes' : '❌ No'}`)
  console.log(`Tables Found: ${existingTables}/${totalRequired}`)
  
  if (results.missingTables.length > 0) {
    console.log(`\n🚨 MISSING TABLES (${results.missingTables.length}):`)
    results.missingTables.forEach(table => {
      console.log(`   ❌ ${table}`)
    })
    
    console.log('\n💡 SOLUTION:')
    console.log('   1. Run the SQL script: prisma/production-setup.sql')
    console.log('   2. In Supabase Dashboard → SQL Editor')
    console.log('   3. Or follow DATABASE_SETUP_GUIDE.md')
  }
  
  if (results.errors.length > 0) {
    console.log(`\n⚠️  ERRORS ENCOUNTERED (${results.errors.length}):`)
    results.errors.forEach(error => {
      console.log(`   • ${error}`)
    })
  }
  
  if (existingTables === totalRequired && results.connected) {
    console.log('\n🎉 DATABASE SETUP COMPLETE!')
    console.log('All required tables exist and are accessible.')
    console.log('The API should now work properly.')
  } else {
    console.log('\n⚠️  DATABASE SETUP INCOMPLETE')
    console.log('Please run the setup script to create missing tables.')
  }
  
  return results
}

// Run verification
verifyDatabase()
  .then(results => {
    const exitCode = results.connected && results.missingTables.length === 0 ? 0 : 1
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('Verification script failed:', error)
    process.exit(1)
  })
