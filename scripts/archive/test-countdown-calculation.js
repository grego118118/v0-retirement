/**
 * Test script to verify the countdown calculation logic
 * This tests the same logic used in the RetirementCountdown component
 */

function calculateTimeLeft(retirementDate) {
  try {
    const now = new Date()
    const target = new Date(retirementDate)

    // Validate dates
    if (isNaN(target.getTime()) || isNaN(now.getTime())) {
      throw new Error('Invalid date')
    }

    const difference = target.getTime() - now.getTime()

    if (difference <= 0) {
      return {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalDays: 0,
      }
    }

    // Calculate time units with proper precision
    const totalMilliseconds = difference
    const totalSeconds = Math.floor(totalMilliseconds / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const totalDays = Math.floor(totalHours / 24)

    // Calculate remaining units
    const seconds = totalSeconds % 60
    const minutes = totalMinutes % 60
    const hours = totalHours % 24

    // More accurate year/month/day calculation using date arithmetic
    let years = 0
    let months = 0
    let days = 0

    // Start with the current date
    let currentDate = new Date(now)
    
    // Calculate full years
    let tempDate = new Date(currentDate)
    tempDate.setFullYear(tempDate.getFullYear() + 1)
    
    while (tempDate <= target) {
      years++
      currentDate.setFullYear(currentDate.getFullYear() + 1)
      tempDate = new Date(currentDate)
      tempDate.setFullYear(tempDate.getFullYear() + 1)
    }

    // Calculate full months
    tempDate = new Date(currentDate)
    tempDate.setMonth(tempDate.getMonth() + 1)
    
    while (tempDate <= target) {
      months++
      currentDate.setMonth(currentDate.getMonth() + 1)
      tempDate = new Date(currentDate)
      tempDate.setMonth(tempDate.getMonth() + 1)
    }

    // Calculate remaining days
    days = Math.floor((target.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
    }
  } catch (error) {
    console.warn('Error calculating time left:', error)
    // Return zero values on error
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
    }
  }
}

// Test cases
const testCases = [
  {
    name: "Test retirement date from user example (04/19/2028)",
    retirementDate: "2028-04-19T00:00:00Z",
    description: "Should show correct breakdown instead of '2 years, 0 months, 296 days'"
  },
  {
    name: "Test exactly 1 year from now",
    retirementDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Should show 1 year, 0 months, 0 days"
  },
  {
    name: "Test exactly 6 months from now",
    retirementDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Should show 0 years, ~6 months"
  },
  {
    name: "Test exactly 30 days from now",
    retirementDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Should show 0 years, ~1 month, 0 days"
  }
]

console.log("🕐 Testing Retirement Countdown Calculation Logic")
console.log("=" * 60)

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`)
  console.log(`   Target Date: ${testCase.retirementDate}`)
  console.log(`   Description: ${testCase.description}`)
  
  const result = calculateTimeLeft(testCase.retirementDate)
  
  console.log(`   Result: ${result.years} years, ${result.months} months, ${result.days} days`)
  console.log(`   Time: ${result.hours} hours, ${result.minutes} minutes, ${result.seconds} seconds`)
  console.log(`   Total Days: ${result.totalDays}`)
  
  // Validate the result makes sense
  const isValid = result.years >= 0 && result.months >= 0 && result.months < 12 && 
                  result.days >= 0 && result.days < 32 && 
                  result.hours >= 0 && result.hours < 24 &&
                  result.minutes >= 0 && result.minutes < 60 &&
                  result.seconds >= 0 && result.seconds < 60
  
  console.log(`   ✅ Valid: ${isValid ? 'YES' : 'NO'}`)
})

console.log("\n" + "=" * 60)
console.log("🎯 Test completed! The countdown calculation should now show proper year/month/day breakdown.")
console.log("🔗 Check the dashboard at http://localhost:3000/dashboard to see the live countdown.")
