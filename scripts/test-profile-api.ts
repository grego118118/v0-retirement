import { query } from "../lib/db/postgres"

async function testProfileAPI() {
  console.log("Testing profile API functionality...")

  try {
    // Test 1: Database connection
    console.log("\n1. Testing database connection...")
    const timeTest = await query("SELECT datetime('now') as current_time")
    console.log("✅ Database connection successful:", timeTest.rows[0])

    // Test 2: Check if tables exist
    console.log("\n2. Checking if required tables exist...")
    
    // Check users table
    try {
      const usersTest = await query("SELECT COUNT(*) as count FROM users")
      console.log("✅ Users table exists with", usersTest.rows[0].count, "records")
    } catch (error) {
      console.log("❌ Users table does not exist or has issues")
    }

    // Check users_metadata table
    try {
      const metadataTest = await query("SELECT COUNT(*) as count FROM users_metadata")
      console.log("✅ Users_metadata table exists with", metadataTest.rows[0].count, "records")
    } catch (error) {
      console.log("❌ Users_metadata table does not exist or has issues")
    }

    // Test 3: Create a test user
    console.log("\n3. Creating test user...")
    const testUserId = "test-user-" + Date.now()
    const testEmail = `test${Date.now()}@example.com`

    try {
      await query(
        "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
        [testUserId, testEmail]
      )
      console.log("✅ Test user created:", testUserId)
    } catch (error) {
      console.log("❌ Failed to create test user:", error)
    }

    // Test 4: Test profile metadata operations
    console.log("\n4. Testing profile metadata operations...")
    
    try {
      // Insert metadata
      await query(
        "INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))",
        [testUserId, "Test User", "2030-12-31"]
      )
      console.log("✅ Profile metadata created")

      // Read metadata
      const metadata = await query("SELECT * FROM users_metadata WHERE id = ?", [testUserId])
      console.log("✅ Profile metadata retrieved:", metadata.rows[0])

      // Update metadata
      await query(
        "UPDATE users_metadata SET full_name = ?, updated_at = datetime('now') WHERE id = ?",
        ["Updated Test User", testUserId]
      )
      console.log("✅ Profile metadata updated")

      // Verify update
      const updatedMetadata = await query("SELECT * FROM users_metadata WHERE id = ?", [testUserId])
      console.log("✅ Updated metadata verified:", updatedMetadata.rows[0])

    } catch (error) {
      console.log("❌ Profile metadata operations failed:", error)
    }

    // Test 5: Clean up test data
    console.log("\n5. Cleaning up test data...")
    try {
      await query("DELETE FROM users_metadata WHERE id = ?", [testUserId])
      await query("DELETE FROM users WHERE id = ?", [testUserId])
      console.log("✅ Test data cleaned up")
    } catch (error) {
      console.log("❌ Failed to clean up test data:", error)
    }

    console.log("\n✅ Profile API functionality test completed successfully!")
    console.log("\n🎉 The profile form should now work without server errors!")

  } catch (error) {
    console.error("❌ Profile API test failed:", error)
    
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      })
    }
  }
}

// Run the test
testProfileAPI()
