/**
 * Simple verification script for planType ReferenceError fix
 * This script checks if the fix has been applied correctly
 */

const fs = require('fs')
const path = require('path')

function verifyPlanTypeFix() {
  console.log('🔍 Verifying planType ReferenceError fix...\n')
  
  const demoCheckoutPath = path.join(__dirname, 'app/subscribe/demo-checkout/page.tsx')
  
  try {
    // Read the demo checkout file
    const fileContent = fs.readFileSync(demoCheckoutPath, 'utf8')
    
    // Check for the problematic planType usage
    const lines = fileContent.split('\n')
    let hasError = false
    let fixedLine = null
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      
      // Check for the specific error pattern: plan: planType,
      if (line.includes('plan: planType,')) {
        console.log(`❌ ERROR FOUND at line ${lineNumber}:`)
        console.log(`   ${line.trim()}`)
        console.log(`   This should be: plan: plan,`)
        hasError = true
      }
      
      // Check for the correct pattern: plan: plan,
      if (line.includes('plan: plan,')) {
        console.log(`✅ CORRECT USAGE found at line ${lineNumber}:`)
        console.log(`   ${line.trim()}`)
        fixedLine = lineNumber
      }
      
      // Check for any other suspicious planType usage
      if (line.includes('planType') && !line.includes('{ planType: plan }') && !line.includes('planType:') && !line.includes('// ')) {
        console.log(`⚠️  SUSPICIOUS planType usage at line ${lineNumber}:`)
        console.log(`   ${line.trim()}`)
      }
    })
    
    console.log('\n📊 VERIFICATION RESULTS:')
    
    if (hasError) {
      console.log('❌ planType ReferenceError still exists!')
      console.log('   The fix has NOT been applied correctly.')
      return false
    } else if (fixedLine) {
      console.log('✅ planType ReferenceError has been fixed!')
      console.log(`   Correct usage found at line ${fixedLine}`)
      console.log('   The fix has been applied successfully.')
      return true
    } else {
      console.log('⚠️  Could not find the expected fix location.')
      console.log('   Please verify the file structure.')
      return false
    }
    
  } catch (error) {
    console.error('❌ Error reading demo checkout file:', error.message)
    return false
  }
}

function checkServerStatus() {
  console.log('\n🔧 TROUBLESHOOTING STEPS:')
  console.log('1. Clear Next.js cache: Remove-Item -Recurse -Force .next')
  console.log('2. Restart development server: npm run dev')
  console.log('3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)')
  console.log('4. Check browser console for any remaining errors')
  console.log('\n🧪 MANUAL TESTING:')
  console.log('1. Navigate to: http://localhost:3000/pricing')
  console.log('2. Click "Start Monthly Plan" or "Start Annual Plan"')
  console.log('3. Complete authentication if required')
  console.log('4. On demo checkout page, open browser console')
  console.log('5. Click "Complete Demo Payment" button')
  console.log('6. Verify no "planType is not defined" error appears')
  console.log('7. Check for success message: "Premium access granted:"')
}

function main() {
  console.log('🚀 Massachusetts Retirement System - planType Fix Verification')
  console.log('=' .repeat(65))
  
  const isFixed = verifyPlanTypeFix()
  
  if (isFixed) {
    console.log('\n🎉 SUCCESS! The planType ReferenceError has been fixed.')
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Restart the development server if it\'s running')
    console.log('2. Clear browser cache')
    console.log('3. Test both monthly and annual checkout flows')
    console.log('4. Verify subscription status updates correctly')
  } else {
    console.log('\n❌ ISSUE DETECTED! The fix may not be complete.')
    checkServerStatus()
  }
  
  console.log('\n' + '=' .repeat(65))
}

// Run verification if this script is executed directly
if (require.main === module) {
  main()
}

module.exports = { verifyPlanTypeFix, checkServerStatus }
