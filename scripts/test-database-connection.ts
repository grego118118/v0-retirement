import { query } from "../lib/db/postgres"

async function testDatabaseConnection() {
  console.log("Testing database connection and schema...")
  
  try {
    // Test basic connection
    console.log("1. Testing basic database connection...")
    const connectionTest = await query("SELECT NOW() as current_time")
    console.log("✅ Database connection successful:", connectionTest.rows[0])

    // Check if users table exists
    console.log("\n2. Checking users table...")
    const usersTableCheck = await query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `)
    
    if (usersTableCheck.rows.length === 0) {
      console.log("❌ Users table does not exist")
    } else {
      console.log("✅ Users table exists with columns:")
      usersTableCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
      })
    }

    // Check if users_metadata table exists
    console.log("\n3. Checking users_metadata table...")
    const metadataTableCheck = await query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users_metadata'
      ORDER BY ordinal_position
    `)
    
    if (metadataTableCheck.rows.length === 0) {
      console.log("❌ Users_metadata table does not exist")
    } else {
      console.log("✅ Users_metadata table exists with columns:")
      metadataTableCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
      })
    }

    // Check for existing users
    console.log("\n4. Checking existing users...")
    const usersCount = await query("SELECT COUNT(*) as count FROM users")
    console.log(`✅ Found ${usersCount.rows[0].count} users in database`)

    if (parseInt(usersCount.rows[0].count) > 0) {
      const sampleUsers = await query("SELECT id, email, created_at FROM users LIMIT 3")
      console.log("Sample users:")
      sampleUsers.rows.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`)
      })
    }

    // Check for existing metadata
    console.log("\n5. Checking existing metadata...")
    const metadataCount = await query("SELECT COUNT(*) as count FROM users_metadata")
    console.log(`✅ Found ${metadataCount.rows[0].count} metadata records`)

    if (parseInt(metadataCount.rows[0].count) > 0) {
      const sampleMetadata = await query(`
        SELECT um.id, um.full_name, um.retirement_date, u.email 
        FROM users_metadata um 
        JOIN users u ON um.id = u.id 
        LIMIT 3
      `)
      console.log("Sample metadata:")
      sampleMetadata.rows.forEach(meta => {
        console.log(`  - User: ${meta.email}, Name: ${meta.full_name}, Retirement: ${meta.retirement_date}`)
      })
    }

    // Test environment variables
    console.log("\n6. Checking environment variables...")
    console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set")
    console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set")
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Not set")
    console.log("NODE_ENV:", process.env.NODE_ENV)

    console.log("\n✅ Database test completed successfully!")

  } catch (error) {
    console.error("❌ Database test failed:", error)
    
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes("connect")) {
      console.error("\n🔧 Connection troubleshooting:")
      console.error("1. Check if PostgreSQL is running")
      console.error("2. Verify POSTGRES_URL environment variable")
      console.error("3. Check database credentials and permissions")
      console.error("4. Ensure database exists")
    }
    
    // Check if it's a table error
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      console.error("\n🔧 Table troubleshooting:")
      console.error("1. Run database setup: npm run setup:db")
      console.error("2. Check if migrations have been applied")
      console.error("3. Verify table creation scripts")
    }
  }
}

// Run the test
testDatabaseConnection()
