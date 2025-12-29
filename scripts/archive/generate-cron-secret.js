// Generate a secure CRON_SECRET for Massachusetts Retirement System
// Run with: node generate-cron-secret.js

const crypto = require('crypto')

function generateCronSecret() {
  // Generate a cryptographically secure random string
  const secret = crypto.randomBytes(32).toString('hex')
  
  console.log('🔐 Generated CRON_SECRET for Massachusetts Retirement System')
  console.log('=' * 60)
  console.log(`CRON_SECRET=${secret}`)
  console.log('=' * 60)
  
  console.log('\n📋 Next Steps:')
  console.log('1. Add this to your .env.local file:')
  console.log(`   CRON_SECRET=${secret}`)
  
  console.log('\n2. Add this to your production environment variables:')
  console.log('   - Vercel Dashboard → Project → Settings → Environment Variables')
  console.log('   - Or your hosting platform\'s environment config')
  
  console.log('\n3. Configure n8n with this secret:')
  console.log('   - n8n Settings → Environment Variables')
  console.log(`   - Set: CRON_SECRET=${secret}`)
  
  console.log('\n4. Use in n8n workflows:')
  console.log('   - Authorization header: Bearer {{$env.CRON_SECRET}}')
  
  console.log('\n⚠️  Security Notes:')
  console.log('   - Keep this secret secure and private')
  console.log('   - Don\'t commit it to version control')
  console.log('   - Use the same secret in both your app and n8n')
  console.log('   - Regenerate if compromised')
  
  return secret
}

// Generate and display the secret
generateCronSecret()
