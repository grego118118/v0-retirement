"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { motion } from "framer-motion"

interface PensionResultsProps {
  result: {
    selectedOption: string
    optionWarning?: string
    annualPension: number
    monthlyPension: number
    survivorAnnualPension?: number
    survivorMonthlyPension?: number
    details: {
      averageSalary: number
      group: string
      age: number
      yearsOfService: number
      basePercentage: number
      baseAnnualPension: number
      cappedBase: boolean
    }
  }
}

export default function PensionResults({ result }: PensionResultsProps) {
  const showSurvivorBenefit = result.survivorAnnualPension && result.survivorAnnualPension > 0

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight mb-1">Your Estimated Pension</h2>
          <p className="text-md font-medium text-primary">{result.selectedOption}</p>
        </motion.div>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download PDF</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2"></div>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-center mb-2">Annual Pension</h3>
              <p className="text-3xl font-bold text-center text-green-600 dark:text-green-500">
                ${result.annualPension.toFixed(2)}
              </p>
              <p className="text-sm text-center text-muted-foreground mt-1">per year</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2"></div>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-center mb-2">Monthly Pension</h3>
              <p className="text-3xl font-bold text-center text-blue-600 dark:text-blue-500">
                ${result.monthlyPension.toFixed(2)}
              </p>
              <p className="text-sm text-center text-muted-foreground mt-1">per month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {showSurvivorBenefit && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2"></div>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-center mb-2">Survivor Benefits (Option C)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Annual Benefit</p>
                  <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    ${result.survivorAnnualPension?.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monthly Benefit</p>
                  <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    ${result.survivorMonthlyPension?.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.optionWarning && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-900/30 dark:text-orange-400">
          <AlertDescription>{result.optionWarning}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
