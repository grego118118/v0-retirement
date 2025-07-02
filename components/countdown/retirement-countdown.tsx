"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Settings, Target, Calculator } from "lucide-react"
import Link from "next/link"

interface RetirementCountdownProps {
  retirementDate: Date | null
  className?: string
}

interface TimeLeft {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
}

export function RetirementCountdown({ retirementDate, className = "" }: RetirementCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!retirementDate || !mounted) return

    const calculateTimeLeft = (): TimeLeft => {
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

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Optimized update strategy using requestAnimationFrame for better performance
    let animationFrame: number
    let lastUpdate = Date.now()

    const optimizedUpdate = () => {
      const now = Date.now()

      // Only update if at least 1 second has passed
      if (now - lastUpdate >= 1000) {
        setTimeLeft(calculateTimeLeft())
        lastUpdate = now
      }

      // Continue animation loop only if component is still mounted
      if (mounted) {
        animationFrame = requestAnimationFrame(optimizedUpdate)
      }
    }

    // Start the optimized update loop
    animationFrame = requestAnimationFrame(optimizedUpdate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [retirementDate, mounted])

  if (!mounted) {
    return (
      <Card className={className}>
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Retirement Countdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg h-16"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!retirementDate) {
    return (
      <Card className={className}>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Set Your Retirement Goal
          </CardTitle>
          <CardDescription className="text-gray-100">
            Configure your retirement plan to see your countdown
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Ready to Plan Your Retirement?</h3>
              <p className="text-muted-foreground mb-4">
                Use our pension calculator to set your retirement date and see exactly how much time you have left.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/calculator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Plan My Retirement
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!timeLeft) return null

  // Check if retirement date is in the past
  const isPast = retirementDate.getTime() < new Date().getTime()

  // Calculate progress percentage (assuming a 40-year career starting at age 25)
  const careerStartAge = 25
  const retirementAge = 65
  const totalCareerYears = retirementAge - careerStartAge
  const yearsUntilRetirement = timeLeft.totalDays / 365
  const progress = Math.max(0, Math.min(100, ((totalCareerYears - yearsUntilRetirement) / totalCareerYears) * 100))

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 lg:px-6 xl:px-8 py-4 lg:py-6 xl:py-8">
        <CardTitle className="flex items-center justify-between text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
          <div className="flex items-center">
            <Clock className="mr-2 lg:mr-3 h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
            {isPast ? "🎉 You've Reached Retirement!" : "⏰ Countdown to Freedom"}
          </div>
          {/* Prominent MM/DD/YYYY Date Display */}
          <div className="bg-white/20 backdrop-blur-sm px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 rounded-lg border border-white/30 shadow-lg">
            <div className="text-center">
              <div className="text-xs lg:text-sm xl:text-base text-indigo-100 font-medium mb-1">
                Target Date
              </div>
              <div className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-white tracking-wider">
                {retirementDate.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </CardTitle>
        <div className="text-indigo-100 text-sm lg:text-base xl:text-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
              <span>Full Date: {retirementDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {!isPast && (
              <span className="text-sm lg:text-base bg-white/20 px-2 lg:px-3 py-1 lg:py-2 rounded">
                {Math.round(progress)}% Complete
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 lg:p-8 xl:p-10">
        {isPast ? (
          <div className="text-center py-8 lg:py-12 xl:py-16">
            <div className="text-6xl lg:text-7xl xl:text-8xl mb-4 lg:mb-6">🎊</div>
            <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-indigo-600 mb-2 lg:mb-4">Congratulations!</h3>
            <p className="text-muted-foreground text-lg lg:text-xl xl:text-2xl">
              You've reached your retirement date. Enjoy your well-deserved retirement!
            </p>
            <div className="mt-6 lg:mt-8 xl:mt-10 p-4 lg:p-6 xl:p-8 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-medium text-lg lg:text-xl xl:text-2xl">
                🌟 Welcome to the next chapter of your life! 🌟
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4 xl:gap-6 mb-6 lg:mb-8 xl:mb-10">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 lg:p-5 xl:p-6 rounded-lg text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                  {timeLeft.years}
                </div>
                <div className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">Years</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 lg:p-5 xl:p-6 rounded-lg text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-purple-600 dark:text-purple-400">
                  {timeLeft.months}
                </div>
                <div className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">Months</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 lg:p-5 xl:p-6 rounded-lg text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.days}</div>
                <div className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">Days</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 lg:p-5 xl:p-6 rounded-lg text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600 dark:text-green-400">
                  {timeLeft.hours}
                </div>
                <div className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">Hours</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 lg:p-5 xl:p-6 rounded-lg text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                  {timeLeft.minutes}
                </div>
                <div className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">Minutes</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 lg:p-5 xl:p-6 rounded-lg text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-red-600 dark:text-red-400">
                  {timeLeft.seconds}
                </div>
                <div className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">Seconds</div>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6 xl:space-y-8">
              <div className="bg-muted p-4 lg:p-6 xl:p-8 rounded-lg">
                <div className="flex justify-between mb-2 lg:mb-3">
                  <span className="text-sm lg:text-base xl:text-lg font-medium">Career Progress</span>
                  <span className="text-sm lg:text-base xl:text-lg text-muted-foreground">
                    {timeLeft.totalDays.toLocaleString()} days remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 lg:h-4 xl:h-5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 lg:h-4 xl:h-5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 lg:mt-3 text-xs lg:text-sm xl:text-base text-muted-foreground">
                  <span>Career Start</span>
                  <span className="font-medium">{Math.round(progress)}% Complete</span>
                  <span>Retirement</span>
                </div>
              </div>

              {timeLeft.totalDays <= 365 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800 p-4 lg:p-6 xl:p-8 rounded-lg">
                  <p className="text-orange-700 dark:text-orange-400 font-medium text-center text-base lg:text-lg xl:text-xl">
                    🔥 Less than a year to go! Time to finalize your retirement plans! 🔥
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
