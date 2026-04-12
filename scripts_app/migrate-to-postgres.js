/**
 * Database Migration Script
 * Migrates from SQLite to PostgreSQL for production deployment
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Configuration
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './prisma/dev.db'
const POSTGRES_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!POSTGRES_URL) {
  console.error('❌ PostgreSQL connection URL not provided')
  console.error('Set DATABASE_URL or POSTGRES_URL environment variable')
  process.exit(1)
}

// Initialize Prisma clients
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: `file:${SQLITE_DB_PATH}`
    }
  }
})

const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: POSTGRES_URL
    }
  }
})

/**
 * Migration utility functions
 */
class DatabaseMigrator {
  constructor() {
    this.migrationLog = []
    this.errors = []
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    this.migrationLog.push(logMessage)
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString()
    const errorMessage = `[${timestamp}] ERROR: ${message}`
    console.error(errorMessage)
    if (error) {
      console.error(error)
    }
    this.errors.push({ message: errorMessage, error })
  }

  /**
   * Check if SQLite database exists and has data
   */
  async checkSQLiteDatabase() {
    try {
      if (!fs.existsSync(SQLITE_DB_PATH)) {
        this.log('No SQLite database found - starting fresh PostgreSQL setup')
        return false
      }

      // Test connection and check for data
      const userCount = await sqliteClient.user.count()
      this.log(`Found SQLite database with ${userCount} users`)
      return userCount > 0
    } catch (error) {
      this.error('Failed to check SQLite database', error)
      return false
    }
  }

  /**
   * Setup PostgreSQL database schema
   */
  async setupPostgreSQLSchema() {
    try {
      this.log('Setting up PostgreSQL schema...')
      
      // Run Prisma migrations
      const { execSync } = require('child_process')
      execSync('npx prisma db push', { 
        env: { ...process.env, DATABASE_URL: POSTGRES_URL },
        stdio: 'inherit'
      })
      
      this.log('PostgreSQL schema setup complete')
      return true
    } catch (error) {
      this.error('Failed to setup PostgreSQL schema', error)
      return false
    }
  }

  /**
   * Migrate users table
   */
  async migrateUsers() {
    try {
      this.log('Migrating users...')
      
      const users = await sqliteClient.user.findMany({
        include: {
          accounts: true,
          sessions: true,
          profile: true,
          calculations: true
        }
      })

      for (const user of users) {
        const { accounts, sessions, profile, calculations, ...userData } = user
        
        // Create user
        const newUser = await postgresClient.user.create({
          data: {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt)
          }
        })

        // Migrate accounts
        for (const account of accounts) {
          await postgresClient.account.create({
            data: {
              ...account,
              userId: newUser.id
            }
          })
        }

        // Migrate sessions
        for (const session of sessions) {
          await postgresClient.session.create({
            data: {
              ...session,
              userId: newUser.id,
              expires: new Date(session.expires)
            }
          })
        }

        // Migrate profile
        if (profile) {
          await postgresClient.retirementProfile.create({
            data: {
              ...profile,
              userId: newUser.id,
              dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
              hireDate: profile.hireDate ? new Date(profile.hireDate) : null,
              expectedRetirementDate: profile.expectedRetirementDate ? new Date(profile.expectedRetirementDate) : null,
              createdAt: new Date(profile.createdAt),
              updatedAt: new Date(profile.updatedAt)
            }
          })
        }

        // Migrate calculations
        for (const calculation of calculations) {
          await postgresClient.retirementCalculation.create({
            data: {
              ...calculation,
              userId: newUser.id,
              createdAt: new Date(calculation.createdAt),
              updatedAt: new Date(calculation.updatedAt)
            }
          })
        }
      }

      this.log(`Migrated ${users.length} users successfully`)
      return true
    } catch (error) {
      this.error('Failed to migrate users', error)
      return false
    }
  }

  /**
   * Verify migration integrity
   */
  async verifyMigration() {
    try {
      this.log('Verifying migration integrity...')
      
      const sqliteUserCount = await sqliteClient.user.count()
      const postgresUserCount = await postgresClient.user.count()
      
      if (sqliteUserCount !== postgresUserCount) {
        this.error(`User count mismatch: SQLite(${sqliteUserCount}) vs PostgreSQL(${postgresUserCount})`)
        return false
      }

      const sqliteCalculationCount = await sqliteClient.retirementCalculation.count()
      const postgresCalculationCount = await postgresClient.retirementCalculation.count()
      
      if (sqliteCalculationCount !== postgresCalculationCount) {
        this.error(`Calculation count mismatch: SQLite(${sqliteCalculationCount}) vs PostgreSQL(${postgresCalculationCount})`)
        return false
      }

      this.log('Migration verification successful')
      return true
    } catch (error) {
      this.error('Failed to verify migration', error)
      return false
    }
  }

  /**
   * Create backup of SQLite database
   */
  async createBackup() {
    try {
      const backupPath = `${SQLITE_DB_PATH}.backup.${Date.now()}`
      fs.copyFileSync(SQLITE_DB_PATH, backupPath)
      this.log(`Created SQLite backup: ${backupPath}`)
      return backupPath
    } catch (error) {
      this.error('Failed to create backup', error)
      return null
    }
  }

  /**
   * Save migration log
   */
  async saveMigrationLog() {
    try {
      const logPath = path.join(__dirname, `migration-log-${Date.now()}.txt`)
      const logContent = [
        'Massachusetts Retirement System - Database Migration Log',
        '=' .repeat(60),
        '',
        ...this.migrationLog,
        '',
        'Errors:',
        '-'.repeat(20),
        ...this.errors.map(e => e.message)
      ].join('\n')
      
      fs.writeFileSync(logPath, logContent)
      this.log(`Migration log saved: ${logPath}`)
    } catch (error) {
      console.error('Failed to save migration log:', error)
    }
  }

  /**
   * Run complete migration process
   */
  async migrate() {
    this.log('Starting database migration from SQLite to PostgreSQL')
    
    try {
      // Check if we have data to migrate
      const hasData = await this.checkSQLiteDatabase()
      
      // Setup PostgreSQL schema
      const schemaSetup = await this.setupPostgreSQLSchema()
      if (!schemaSetup) {
        throw new Error('Failed to setup PostgreSQL schema')
      }

      // If we have SQLite data, migrate it
      if (hasData) {
        // Create backup
        const backupPath = await this.createBackup()
        if (!backupPath) {
          throw new Error('Failed to create backup')
        }

        // Migrate data
        const migrationSuccess = await this.migrateUsers()
        if (!migrationSuccess) {
          throw new Error('Failed to migrate user data')
        }

        // Verify migration
        const verificationSuccess = await this.verifyMigration()
        if (!verificationSuccess) {
          throw new Error('Migration verification failed')
        }

        this.log('✅ Database migration completed successfully')
      } else {
        this.log('✅ PostgreSQL database setup completed (no data to migrate)')
      }

      return true
    } catch (error) {
      this.error('Migration failed', error)
      return false
    } finally {
      await this.saveMigrationLog()
      await sqliteClient.$disconnect()
      await postgresClient.$disconnect()
    }
  }
}

/**
 * Main migration execution
 */
async function main() {
  const migrator = new DatabaseMigrator()
  
  console.log('🚀 Massachusetts Retirement System - Database Migration')
  console.log('=' .repeat(60))
  console.log(`SQLite Path: ${SQLITE_DB_PATH}`)
  console.log(`PostgreSQL URL: ${POSTGRES_URL.replace(/:[^:@]*@/, ':***@')}`)
  console.log('')

  const success = await migrator.migrate()
  
  if (success) {
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } else {
    console.log('\n❌ Migration failed!')
    process.exit(1)
  }
}

// Run migration if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { DatabaseMigrator }
