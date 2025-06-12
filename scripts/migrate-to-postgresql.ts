#!/usr/bin/env tsx

/**
 * Massachusetts Retirement System - PostgreSQL Migration Script
 * 
 * This script safely migrates data from SQLite to PostgreSQL for production deployment.
 * It includes data validation, integrity checks, and rollback capabilities.
 */

import { PrismaClient as SQLitePrismaClient } from '@prisma/client'
import { PrismaClient as PostgresPrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Configuration
const SQLITE_DATABASE_URL = process.env.SQLITE_DATABASE_URL || 'file:./dev.db'
const POSTGRES_DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL

if (!POSTGRES_DATABASE_URL) {
  console.error('❌ PostgreSQL DATABASE_URL is required')
  process.exit(1)
}

// Initialize clients
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: SQLITE_DATABASE_URL
    }
  }
})

const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: POSTGRES_DATABASE_URL
    }
  }
})

interface MigrationStats {
  users: number
  profiles: number
  calculations: number
  scenarios: number
  scenarioResults: number
  actionItems: number
  errors: string[]
}

async function validateConnections() {
  console.log('🔍 Validating database connections...')
  
  try {
    await sqliteClient.$connect()
    console.log('✅ SQLite connection successful')
  } catch (error) {
    console.error('❌ SQLite connection failed:', error)
    throw error
  }

  try {
    await postgresClient.$connect()
    console.log('✅ PostgreSQL connection successful')
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    throw error
  }
}

async function createBackup() {
  console.log('💾 Creating backup of current data...')
  
  const backupDir = path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(backupDir, `sqlite-backup-${timestamp}.json`)

  try {
    // Export all data from SQLite
    const [users, profiles, calculations, scenarios, scenarioResults, actionItems] = await Promise.all([
      sqliteClient.user.findMany(),
      sqliteClient.userProfile.findMany(),
      sqliteClient.retirementCalculation.findMany(),
      sqliteClient.retirementScenario.findMany(),
      sqliteClient.scenarioResult.findMany(),
      sqliteClient.actionItem.findMany()
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      users,
      profiles,
      calculations,
      scenarios,
      scenarioResults,
      actionItems
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
    console.log(`✅ Backup created: ${backupFile}`)
    
    return backupFile
  } catch (error) {
    console.error('❌ Backup creation failed:', error)
    throw error
  }
}

async function migrateData(): Promise<MigrationStats> {
  console.log('🚀 Starting data migration...')
  
  const stats: MigrationStats = {
    users: 0,
    profiles: 0,
    calculations: 0,
    scenarios: 0,
    scenarioResults: 0,
    actionItems: 0,
    errors: []
  }

  try {
    // Migrate Users
    console.log('👥 Migrating users...')
    const users = await sqliteClient.user.findMany()
    
    for (const user of users) {
      try {
        await postgresClient.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        })
        stats.users++
      } catch (error) {
        const errorMsg = `Failed to migrate user ${user.id}: ${error}`
        console.error('❌', errorMsg)
        stats.errors.push(errorMsg)
      }
    }
    console.log(`✅ Migrated ${stats.users} users`)

    // Migrate User Profiles
    console.log('📋 Migrating user profiles...')
    const profiles = await sqliteClient.userProfile.findMany()
    
    for (const profile of profiles) {
      try {
        await postgresClient.userProfile.upsert({
          where: { userId: profile.userId },
          update: profile,
          create: profile
        })
        stats.profiles++
      } catch (error) {
        const errorMsg = `Failed to migrate profile for user ${profile.userId}: ${error}`
        console.error('❌', errorMsg)
        stats.errors.push(errorMsg)
      }
    }
    console.log(`✅ Migrated ${stats.profiles} profiles`)

    // Migrate Retirement Calculations
    console.log('🧮 Migrating retirement calculations...')
    const calculations = await sqliteClient.retirementCalculation.findMany()
    
    for (const calculation of calculations) {
      try {
        await postgresClient.retirementCalculation.upsert({
          where: { id: calculation.id },
          update: calculation,
          create: calculation
        })
        stats.calculations++
      } catch (error) {
        const errorMsg = `Failed to migrate calculation ${calculation.id}: ${error}`
        console.error('❌', errorMsg)
        stats.errors.push(errorMsg)
      }
    }
    console.log(`✅ Migrated ${stats.calculations} calculations`)

    // Migrate Retirement Scenarios
    console.log('🎯 Migrating retirement scenarios...')
    const scenarios = await sqliteClient.retirementScenario.findMany()
    
    for (const scenario of scenarios) {
      try {
        await postgresClient.retirementScenario.upsert({
          where: { id: scenario.id },
          update: scenario,
          create: scenario
        })
        stats.scenarios++
      } catch (error) {
        const errorMsg = `Failed to migrate scenario ${scenario.id}: ${error}`
        console.error('❌', errorMsg)
        stats.errors.push(errorMsg)
      }
    }
    console.log(`✅ Migrated ${stats.scenarios} scenarios`)

    // Migrate Scenario Results
    console.log('📊 Migrating scenario results...')
    const scenarioResults = await sqliteClient.scenarioResult.findMany()
    
    for (const result of scenarioResults) {
      try {
        await postgresClient.scenarioResult.upsert({
          where: { id: result.id },
          update: result,
          create: result
        })
        stats.scenarioResults++
      } catch (error) {
        const errorMsg = `Failed to migrate scenario result ${result.id}: ${error}`
        console.error('❌', errorMsg)
        stats.errors.push(errorMsg)
      }
    }
    console.log(`✅ Migrated ${stats.scenarioResults} scenario results`)

    // Migrate Action Items
    console.log('✅ Migrating action items...')
    const actionItems = await sqliteClient.actionItem.findMany()
    
    for (const item of actionItems) {
      try {
        await postgresClient.actionItem.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
        stats.actionItems++
      } catch (error) {
        const errorMsg = `Failed to migrate action item ${item.id}: ${error}`
        console.error('❌', errorMsg)
        stats.errors.push(errorMsg)
      }
    }
    console.log(`✅ Migrated ${stats.actionItems} action items`)

    return stats
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function validateMigration(stats: MigrationStats) {
  console.log('🔍 Validating migration...')
  
  try {
    // Count records in PostgreSQL
    const [pgUsers, pgProfiles, pgCalculations, pgScenarios, pgScenarioResults, pgActionItems] = await Promise.all([
      postgresClient.user.count(),
      postgresClient.userProfile.count(),
      postgresClient.retirementCalculation.count(),
      postgresClient.retirementScenario.count(),
      postgresClient.scenarioResult.count(),
      postgresClient.actionItem.count()
    ])

    // Count records in SQLite
    const [sqliteUsers, sqliteProfiles, sqliteCalculations, sqliteScenarios, sqliteScenariosResults, sqliteActionItems] = await Promise.all([
      sqliteClient.user.count(),
      sqliteClient.userProfile.count(),
      sqliteClient.retirementCalculation.count(),
      sqliteClient.retirementScenario.count(),
      sqliteClient.scenarioResult.count(),
      sqliteClient.actionItem.count()
    ])

    console.log('\n📊 Migration Validation Results:')
    console.log(`Users: SQLite(${sqliteUsers}) → PostgreSQL(${pgUsers}) | Migrated: ${stats.users}`)
    console.log(`Profiles: SQLite(${sqliteProfiles}) → PostgreSQL(${pgProfiles}) | Migrated: ${stats.profiles}`)
    console.log(`Calculations: SQLite(${sqliteCalculations}) → PostgreSQL(${pgCalculations}) | Migrated: ${stats.calculations}`)
    console.log(`Scenarios: SQLite(${sqliteScenarios}) → PostgreSQL(${pgScenarios}) | Migrated: ${stats.scenarios}`)
    console.log(`Scenario Results: SQLite(${sqliteScenariosResults}) → PostgreSQL(${pgScenarioResults}) | Migrated: ${stats.scenarioResults}`)
    console.log(`Action Items: SQLite(${sqliteActionItems}) → PostgreSQL(${pgActionItems}) | Migrated: ${stats.actionItems}`)

    // Check for discrepancies
    const discrepancies = []
    if (pgUsers !== stats.users) discrepancies.push('Users')
    if (pgProfiles !== stats.profiles) discrepancies.push('Profiles')
    if (pgCalculations !== stats.calculations) discrepancies.push('Calculations')
    if (pgScenarios !== stats.scenarios) discrepancies.push('Scenarios')
    if (pgScenarioResults !== stats.scenarioResults) discrepancies.push('Scenario Results')
    if (pgActionItems !== stats.actionItems) discrepancies.push('Action Items')

    if (discrepancies.length > 0) {
      console.warn(`⚠️  Discrepancies found in: ${discrepancies.join(', ')}`)
    } else {
      console.log('✅ All data migrated successfully!')
    }

    if (stats.errors.length > 0) {
      console.warn(`⚠️  ${stats.errors.length} errors occurred during migration:`)
      stats.errors.forEach(error => console.warn(`   - ${error}`))
    }

    return discrepancies.length === 0 && stats.errors.length === 0
  } catch (error) {
    console.error('❌ Validation failed:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Massachusetts Retirement System - PostgreSQL Migration')
  console.log('=' .repeat(60))

  try {
    // Step 1: Validate connections
    await validateConnections()

    // Step 2: Create backup
    const backupFile = await createBackup()

    // Step 3: Migrate data
    const stats = await migrateData()

    // Step 4: Validate migration
    const isValid = await validateMigration(stats)

    // Step 5: Summary
    console.log('\n' + '=' .repeat(60))
    console.log('📋 Migration Summary:')
    console.log(`✅ Users migrated: ${stats.users}`)
    console.log(`✅ Profiles migrated: ${stats.profiles}`)
    console.log(`✅ Calculations migrated: ${stats.calculations}`)
    console.log(`✅ Scenarios migrated: ${stats.scenarios}`)
    console.log(`✅ Scenario Results migrated: ${stats.scenarioResults}`)
    console.log(`✅ Action Items migrated: ${stats.actionItems}`)
    console.log(`📁 Backup created: ${backupFile}`)
    
    if (isValid) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('💡 Next steps:')
      console.log('   1. Update DATABASE_URL in production environment')
      console.log('   2. Run database migrations: npx prisma migrate deploy')
      console.log('   3. Test application functionality')
      console.log('   4. Monitor application performance')
    } else {
      console.log('\n⚠️  Migration completed with issues. Please review the errors above.')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.log('\n🔄 Rollback instructions:')
    console.log('   1. Restore from backup if needed')
    console.log('   2. Check database connections')
    console.log('   3. Review error logs')
    process.exit(1)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { main as migrateToPostgreSQL }
