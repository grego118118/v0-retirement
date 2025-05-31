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

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = retirementDate.getTime() - now.getTime()

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

      // Calculate time units
      const seconds = Math.floor((difference / 1000) % 60)
      const minutes = Math.floor((difference / (1000 * 60)) % 60)
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)

      // Calculate total days first
      const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24))

      // Then break it down to years, months, and remaining days
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365

      // Approximate months (not exact due to varying month lengths)
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30

      return {
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
      }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
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
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          {isPast ? "🎉 You've Reached Retirement!" : "⏰ Countdown to Freedom"}
        </CardTitle>
        <CardDescription className="text-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Target Date: {retirementDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            {!isPast && (
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {Math.round(progress)}% Complete
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isPast ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎊</div>
            <h3 className="text-2xl font-bold text-indigo-600 mb-2">Congratulations!</h3>
            <p className="text-muted-foreground text-lg">
              You've reached your retirement date. Enjoy your well-deserved retirement!
            </p>
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-medium">
                🌟 Welcome to the next chapter of your life! 🌟
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {timeLeft.years}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Years</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {timeLeft.months}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Months</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.days}</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Days</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  {timeLeft.hours}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Hours</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {timeLeft.minutes}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Minutes</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                  {timeLeft.seconds}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Seconds</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Career Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {timeLeft.totalDays.toLocaleString()} days remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Career Start</span>
                  <span className="font-medium">{Math.round(progress)}% Complete</span>
                  <span>Retirement</span>
                </div>
              </div>

              {timeLeft.totalDays <= 365 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                  <p className="text-orange-700 dark:text-orange-400 font-medium text-center">
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
