import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Supabase connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Initialize Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function exportData() {
  console.log("Starting data export from Supabase...")
  const exportDir = path.join(process.cwd(), "data-export")

  // Create export directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  try {
    // Export users
    console.log("Exporting users...")
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      throw new Error(`Error exporting users: ${usersError.message}`)
    }

    fs.writeFileSync(path.join(exportDir, "users.json"), JSON.stringify(users, null, 2))
    console.log(`Exported ${users.users.length} users`)

    // Export users_metadata
    console.log("Exporting users_metadata...")
    const { data: usersMetadata, error: usersMetadataError } = await supabase.from("users_metadata").select("*")

    if (usersMetadataError) {
      throw new Error(`Error exporting users_metadata: ${usersMetadataError.message}`)
    }

    fs.writeFileSync(path.join(exportDir, "users_metadata.json"), JSON.stringify(usersMetadata, null, 2))
    console.log(`Exported ${usersMetadata.length} user metadata records`)

    // Export pension_calculations
    console.log("Exporting pension_calculations...")
    const { data: pensionCalculations, error: pensionCalculationsError } = await supabase
      .from("pension_calculations")
      .select("*")

    if (pensionCalculationsError) {
      throw new Error(`Error exporting pension_calculations: ${pensionCalculationsError.message}`)
    }

    fs.writeFileSync(path.join(exportDir, "pension_calculations.json"), JSON.stringify(pensionCalculations, null, 2))
    console.log(`Exported ${pensionCalculations.length} pension calculations`)

    console.log("Data export completed successfully!")
    console.log(`All data exported to: ${exportDir}`)
  } catch (error) {
    console.error("Export failed:", error)
  }
}

// Run the export function
exportData()
