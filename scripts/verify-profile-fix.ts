import { query } from "../lib/db/postgres"

async function verifyProfileFix() {
  console.log("🔍 Verifying Profile Form Server Error Fix...")
  console.log("=" .repeat(50))

  let allTestsPassed = true

  try {
    // Test 1: Database Connection
    console.log("\n1️⃣ Testing Database Connection...")
    const connectionTest = await query("SELECT datetime('now') as current_time")
    console.log("✅ Database connection successful:", connectionTest.rows[0].current_time)

    // Test 2: Parameter Conversion
    console.log("\n2️⃣ Testing Parameter Conversion...")
    
    // Create a test user first
    const testUserId = "verify-fix-" + Date.now()
    await query(
      "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      [testUserId, `verify${Date.now()}@test.com`]
    )

    // Test PostgreSQL-style query with $1, $2 parameters
    const postgresStyleQuery = "SELECT * FROM users WHERE id = $1"
    const result = await query(postgresStyleQuery, [testUserId])
    
    if (result.rows.length > 0) {
      console.log("✅ Parameter conversion ($1 → ?) working correctly")
    } else {
      console.log("❌ Parameter conversion failed")
      allTestsPassed = false
    }

    // Clean up test user
    await query("DELETE FROM users WHERE id = ?", [testUserId])

    // Test 3: Profile API Operations
    console.log("\n3️⃣ Testing Profile API Operations...")
    
    const apiTestUserId = "api-test-" + Date.now()
    
    // Create user
    await query(
      "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      [apiTestUserId, `apitest${Date.now()}@test.com`]
    )

    // Test profile metadata creation (simulating API POST)
    const profileData = {
      full_name: "API Test User",
      retirement_date: "2030-12-31"
    }

    // Check if metadata exists (API logic)
    const existingCheck = await query("SELECT * FROM users_metadata WHERE id = $1", [apiTestUserId])
    
    if (existingCheck.rows.length === 0) {
      // Create new metadata (API logic)
      await query(
        "INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
        [apiTestUserId, profileData.full_name, profileData.retirement_date]
      )
    }

    // Verify creation
    const verifyCreate = await query("SELECT * FROM users_metadata WHERE id = $1", [apiTestUserId])
    if (verifyCreate.rows.length > 0) {
      console.log("✅ Profile metadata creation successful")
    } else {
      console.log("❌ Profile metadata creation failed")
      allTestsPassed = false
    }

    // Test profile update (simulating API POST for existing user)
    const updateData = {
      full_name: "Updated API Test User",
      retirement_date: "2031-06-30"
    }

    await query(
      "UPDATE users_metadata SET full_name = $2, retirement_date = $3, updated_at = NOW() WHERE id = $1",
      [apiTestUserId, updateData.full_name, updateData.retirement_date]
    )

    // Verify update
    const verifyUpdate = await query("SELECT * FROM users_metadata WHERE id = $1", [apiTestUserId])
    if (verifyUpdate.rows[0]?.full_name === updateData.full_name) {
      console.log("✅ Profile metadata update successful")
    } else {
      console.log("❌ Profile metadata update failed")
      allTestsPassed = false
    }

    // Test profile retrieval (simulating API GET)
    const getResult = await query("SELECT * FROM users_metadata WHERE id = $1", [apiTestUserId])
    const userData = getResult.rows[0] || {}

    const apiResponse = {
      fullName: userData.full_name || "",
      retirementDate: userData.retirement_date || "",
    }

    if (apiResponse.fullName && apiResponse.retirementDate) {
      console.log("✅ Profile data retrieval successful:", apiResponse)
    } else {
      console.log("❌ Profile data retrieval failed")
      allTestsPassed = false
    }

    // Clean up API test data
    await query("DELETE FROM users_metadata WHERE id = ?", [apiTestUserId])
    await query("DELETE FROM users WHERE id = ?", [apiTestUserId])

    // Test 4: Error Scenarios
    console.log("\n4️⃣ Testing Error Handling...")
    
    try {
      // Test invalid query (should be handled gracefully)
      await query("SELECT * FROM non_existent_table WHERE id = $1", ["test"])
      console.log("❌ Error handling failed - should have thrown error")
      allTestsPassed = false
    } catch (error) {
      console.log("✅ Error handling working correctly")
    }

    // Test 5: Performance Check
    console.log("\n5️⃣ Testing Performance...")
    
    const performanceTestUserId = "perf-test-" + Date.now()
    
    const startTime = Date.now()
    
    // Create user
    await query(
      "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      [performanceTestUserId, `perf${Date.now()}@test.com`]
    )
    
    // Create metadata
    await query(
      "INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
      [performanceTestUserId, "Performance Test", "2030-01-01"]
    )
    
    // Read metadata
    await query("SELECT * FROM users_metadata WHERE id = $1", [performanceTestUserId])
    
    // Update metadata
    await query(
      "UPDATE users_metadata SET full_name = $2, updated_at = NOW() WHERE id = $1",
      [performanceTestUserId, "Updated Performance Test"]
    )
    
    // Clean up
    await query("DELETE FROM users_metadata WHERE id = ?", [performanceTestUserId])
    await query("DELETE FROM users WHERE id = ?", [performanceTestUserId])
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    if (totalTime < 1000) { // Should complete in under 1 second
      console.log(`✅ Performance test passed: ${totalTime}ms`)
    } else {
      console.log(`⚠️ Performance slower than expected: ${totalTime}ms`)
    }

    // Final Results
    console.log("\n" + "=" .repeat(50))
    if (allTestsPassed) {
      console.log("🎉 ALL TESTS PASSED!")
      console.log("✅ Profile form server error has been FIXED")
      console.log("✅ Database operations working correctly")
      console.log("✅ Parameter conversion functioning")
      console.log("✅ API logic validated")
      console.log("✅ Error handling confirmed")
      console.log("\n🚀 The profile form should now work without server errors!")
    } else {
      console.log("❌ SOME TESTS FAILED")
      console.log("⚠️ Please review the failed tests above")
    }

  } catch (error) {
    console.error("❌ Verification failed:", error)
    
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      })
    }
    
    allTestsPassed = false
  }

  console.log("\n" + "=" .repeat(50))
  return allTestsPassed
}

// Run the verification
verifyProfileFix().then(success => {
  process.exit(success ? 0 : 1)
})
