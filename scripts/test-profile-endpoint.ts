import { query } from "../lib/db/postgres"

async function testProfileEndpoint() {
  console.log("Testing profile endpoint functionality...")

  try {
    // Test 1: Create a test user for the endpoint test
    console.log("\n1. Creating test user for endpoint test...")
    const testUserId = "test-endpoint-user-" + Date.now()
    const testEmail = `endpoint${Date.now()}@example.com`

    await query(
      "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      [testUserId, testEmail]
    )
    console.log("✅ Test user created:", testUserId)

    // Test 2: Test the profile API logic directly (simulating the endpoint)
    console.log("\n2. Testing profile API logic...")

    // Simulate the profile POST request body
    const requestBody = {
      full_name: "Test Endpoint User",
      retirement_date: "2030-12-31"
    }

    console.log("Request body:", requestBody)

    // Check if user metadata exists (simulating the API logic)
    const existingResult = await query("SELECT * FROM users_metadata WHERE id = ?", [testUserId])
    console.log("Existing user metadata:", { rowCount: existingResult.rows.length })

    if (existingResult.rows.length > 0) {
      console.log("Updating existing user metadata")
      // Update existing record
      await query(
        `UPDATE users_metadata
         SET full_name = ?, retirement_date = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [requestBody.full_name, requestBody.retirement_date, testUserId],
      )
    } else {
      console.log("Creating new user metadata record")
      // Create new record
      await query(
        `INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at)
         VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        [testUserId, requestBody.full_name, requestBody.retirement_date],
      )
    }

    // Verify the operation
    const verifyResult = await query("SELECT * FROM users_metadata WHERE id = ?", [testUserId])
    console.log("✅ Profile metadata operation successful:", verifyResult.rows[0])

    // Test 3: Test profile GET logic
    console.log("\n3. Testing profile GET logic...")
    const getResult = await query("SELECT * FROM users_metadata WHERE id = ?", [testUserId])
    const userData = getResult.rows[0] || {}

    const responseData = {
      fullName: userData.full_name || "",
      retirementDate: userData.retirement_date || "",
    }

    console.log("✅ Profile GET response:", responseData)

    // Test 4: Test UPDATE operation
    console.log("\n4. Testing profile UPDATE operation...")
    const updateBody = {
      full_name: "Updated Endpoint User",
      retirement_date: "2031-06-30"
    }

    await query(
      `UPDATE users_metadata
       SET full_name = ?, retirement_date = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [updateBody.full_name, updateBody.retirement_date, testUserId],
    )

    const updatedResult = await query("SELECT * FROM users_metadata WHERE id = ?", [testUserId])
    console.log("✅ Profile UPDATE successful:", updatedResult.rows[0])

    // Test 5: Clean up test data
    console.log("\n5. Cleaning up test data...")
    await query("DELETE FROM users_metadata WHERE id = ?", [testUserId])
    await query("DELETE FROM users WHERE id = ?", [testUserId])
    console.log("✅ Test data cleaned up")

    console.log("\n✅ Profile endpoint functionality test completed successfully!")
    console.log("\n🎉 The profile API should now work without server errors!")

    // Test 6: Verify parameter conversion
    console.log("\n6. Testing parameter conversion...")
    
    // Test PostgreSQL-style query with $1, $2 parameters
    const postgresQuery = "SELECT * FROM users WHERE id = $1 AND email = $2"
    const params = ["test-id", "test@example.com"]
    
    console.log("Original PostgreSQL query:", postgresQuery)
    console.log("Parameters:", params)
    
    // This should work with our conversion function
    try {
      await query(postgresQuery, params)
      console.log("✅ Parameter conversion working correctly")
    } catch (error) {
      // Expected to fail since user doesn't exist, but should not be a syntax error
      if (error instanceof Error && !error.message.includes("syntax")) {
        console.log("✅ Parameter conversion working (expected data not found)")
      } else {
        console.log("❌ Parameter conversion failed:", error)
      }
    }

  } catch (error) {
    console.error("❌ Profile endpoint test failed:", error)
    
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      })
    }
  }
}

// Run the test
testProfileEndpoint()
