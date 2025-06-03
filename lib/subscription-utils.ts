// Simple in-memory store for demo premium users
// In production, this would be in a database
let premiumUsers = new Set<string>([
  'premium@example.com',
  'test@premium.com',
  'grego118@gmail.com' // Added the user's email manually to ensure premium access
])

// Simple in-memory store for canceled users (for demo)
let canceledUsers = new Set<string>()

// Function to add a user to premium (used by checkout)
export function addPremiumUser(email: string) {
  console.log('Adding premium user:', email)
  premiumUsers.add(email)
  // Remove from canceled list if they were previously canceled
  canceledUsers.delete(email)
  console.log('Current premium users:', Array.from(premiumUsers))
}

// Function to remove a user from premium (used by cancellation)
export function removePremiumUser(email: string) {
  console.log('Removing premium user:', email)
  premiumUsers.delete(email)
  canceledUsers.add(email)
  console.log('Current premium users:', Array.from(premiumUsers))
  console.log('Current canceled users:', Array.from(canceledUsers))
}

// Function to check if user is premium
export function isPremiumUser(email: string) {
  const isUserPremium = premiumUsers.has(email) && !canceledUsers.has(email)
  console.log(`Checking if ${email} is premium:`, isUserPremium)
  console.log('All premium users:', Array.from(premiumUsers))
  console.log('All canceled users:', Array.from(canceledUsers))
  return isUserPremium
}
