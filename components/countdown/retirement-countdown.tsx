"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

interface RetirementCountdownProps {
  retirementDate: Date | null
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

export function RetirementCountdown({ retirementDate }: RetirementCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!retirementDate) return

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
  }, [retirementDate])

  if (!retirementDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-indigo-500" />
            Retirement Countdown
          </CardTitle>
          <CardDescription>Set your retirement date to see your countdown</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>Please set your retirement date in your profile settings</p>
        </CardContent>
      </Card>
    )
  }

  if (!timeLeft) return null

  // Check if retirement date is in the past
  const isPast = retirementDate.getTime() < new Date().getTime()

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          {isPast ? "You've Reached Retirement!" : "Countdown to Retirement"}
        </CardTitle>
        <CardDescription className="text-indigo-100">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Retirement Date: {retirementDate.toLocaleDateString()}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isPast ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-indigo-600 mb-2">Congratulations!</h3>
            <p className="text-muted-foreground">
              You've reached your retirement date. Enjoy your well-deserved retirement!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {timeLeft.years}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Years</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {timeLeft.months}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Months</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{timeLeft.days}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Days</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {timeLeft.hours}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Hours</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {timeLeft.minutes}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {timeLeft.seconds}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Seconds</div>
            </div>
          </div>
        )}
        <div className="mt-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress to retirement:</span>
              <span className="text-sm font-medium">{isPast ? "100%" : `${timeLeft.totalDays} days remaining`}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{
                  width: isPast ? "100%" : "0%",
                  transition: "width 1s ease-in-out",
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
