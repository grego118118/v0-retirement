"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Crown, TrendingUp, DollarSign, Calendar, Info, AlertTriangle, Calculator } from "lucide-react"
import { motion } from "framer-motion"
import { PremiumBadge } from "@/components/premium/premium-gate"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  calculateEnhancedMAPensionCOLA,
  calculateEnhancedMAPensionCOLAProjections,
  getCOLADisplayInfo,
  compareCOLAScenarios
} from "@/lib/pension/ma-cola-calculator"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { calculateRetirementBenefitsProjection, ProjectionParameters } from "@/lib/retirement-benefits-projection"
import { RetirementBenefitsProjection } from "@/components/retirement-benefits-projection"
import { PDFExportButton } from "@/components/pdf/pdf-export-button"
import { PensionCalculationData } from "@/lib/pdf/pdf-generator"

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
  const { upgradeRequired } = useSubscriptionStatus()

  const handlePrint = () => {
    window.print()
  }

  const showSurvivorBenefit = result.survivorAnnualPension && result.survivorAnnualPension > 0

  // Calculate COLA information with robust error handling
  const pensionAmount = result.annualPension && result.annualPension > 0 ? result.annualPension : 0

  const colaResult = calculateEnhancedMAPensionCOLA(pensionAmount)
  const colaProjections = calculateEnhancedMAPensionCOLAProjections(pensionAmount, 10)
  const colaInfo = getCOLADisplayInfo(pensionAmount)
  const colaScenarios = compareCOLAScenarios(pensionAmount, 10)

  // Temporary debugging
  console.log('🔍 COLA Debug:', {
    pensionAmount,
    colaScenarios: colaScenarios?.comparison,
    currentTotal: colaScenarios?.comparison?.currentTotal,
    increasedBaseTotal: colaScenarios?.comparison?.increasedBaseTotal,
    increasedRateTotal: colaScenarios?.comparison?.increasedRateTotal
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with export buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-center">Your Estimated Pension</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <PDFExportButton
            data={{
              currentAge: result.details.age,
              plannedRetirementAge: result.details.age, // Using current age as placeholder
              retirementGroup: result.details.group,
              serviceEntry: 'before_2012', // Default - could be enhanced
              averageSalary: result.details.averageSalary,
              yearsOfService: result.details.yearsOfService,
              projectedYearsAtRetirement: result.details.yearsOfService,
              basePension: result.details.baseAnnualPension,
              benefitFactor: result.details.basePercentage / result.details.yearsOfService,
              totalBenefitPercentage: result.details.basePercentage,
              cappedAt80Percent: result.details.cappedBase,
              options: {
                A: {
                  annual: result.annualPension,
                  monthly: result.monthlyPension,
                  description: `Option A: Full Allowance (100%)`
                },
                B: {
                  annual: result.annualPension * 0.99,
                  monthly: result.monthlyPension * 0.99,
                  description: `Option B: Annuity Protection (1% reduction)`,
                  reduction: 0.01
                },
                C: {
                  annual: result.annualPension * 0.9295,
                  monthly: result.monthlyPension * 0.9295,
                  description: `Option C: Joint & Survivor (66.67%)`,
                  reduction: 0.0705,
                  survivorAnnual: result.survivorAnnualPension || result.annualPension * 0.9295 * 0.6667,
                  survivorMonthly: result.survivorMonthlyPension || result.monthlyPension * 0.9295 * 0.6667
                }
              },
              calculationDate: new Date()
            } as PensionCalculationData}
            reportType="pension"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-sm px-3 py-2">Overview</TabsTrigger>
          <TabsTrigger value="cola" className="text-sm px-3 py-2">
            <span className="hidden sm:inline">COLA Adjustments</span>
            <span className="sm:hidden">COLA</span>
          </TabsTrigger>
          <TabsTrigger value="projections" className="text-sm px-3 py-2">Projections</TabsTrigger>
          <TabsTrigger value="scenarios" className="text-sm px-3 py-2">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
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
                    {formatCurrency(result.annualPension)}
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
                    {formatCurrency(result.monthlyPension)}
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
                        {formatCurrency(result.survivorAnnualPension || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Monthly Benefit</p>
                      <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                        {formatCurrency(result.survivorMonthlyPension || 0)}
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
        </TabsContent>

        {/* COLA Adjustments Tab */}
        <TabsContent value="cola" className="space-y-6 mt-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Massachusetts Pension COLA (FY2025)
              </CardTitle>
              <CardDescription>
                Cost-of-Living Adjustment applied to your pension benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">
                    {colaInfo.currentRate}
                  </div>
                  <div className="text-xs text-muted-foreground">Current COLA Rate</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {colaInfo.baseAmount}
                  </div>
                  <div className="text-xs text-muted-foreground">COLA Base Amount</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(colaResult.calculations[0]?.colaAmount || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Your Annual COLA</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency((colaResult.calculations[0]?.colaAmount || 0) / 12)}
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly COLA</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  COLA Calculation Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Your Annual Pension:</span>
                    <span className="font-medium">{formatCurrency(pensionAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COLA Eligible Amount:</span>
                    <span className="font-medium">{formatCurrency(Math.min(pensionAmount, 13000))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COLA Rate (FY2025):</span>
                    <span className="font-medium">{colaInfo.currentRate}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Annual COLA Increase:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(colaResult.calculations[0]?.colaAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Effective COLA Rate:</span>
                    <span className="font-semibold text-blue-600">{pensionAmount > 0 ? (((colaResult.calculations[0]?.colaAmount || 0) / pensionAmount) * 100).toFixed(2) : '0.00'}%</span>
                  </div>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> COLA is not guaranteed and requires annual legislative approval.
                  The COLA base amount of $13,000 has remained unchanged for many years, though a Special COLA Commission
                  is currently reviewing potential increases.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                10-Year COLA Projections
              </CardTitle>
              <CardDescription>
                Projected pension amounts with annual COLA adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(colaProjections[4]?.endingPension || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Year 5 Pension</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(colaProjections[9]?.endingPension || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Year 10 Pension</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(colaResult.totalIncrease || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total COLA Gained</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Year</th>
                        <th className="text-right p-2">Starting Pension</th>
                        <th className="text-right p-2">COLA Increase</th>
                        <th className="text-right p-2">Ending Pension</th>
                        <th className="text-right p-2">Monthly Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colaProjections.slice(0, 10).map((projection) => (
                        <tr key={projection.year} className="border-b">
                          <td className="p-2 font-medium">Year {projection.year}</td>
                          <td className="p-2 text-right">{formatCurrency(projection.startingPension)}</td>
                          <td className="p-2 text-right text-green-600">+{formatCurrency(projection.colaIncrease)}</td>
                          <td className="p-2 text-right font-semibold">{formatCurrency(projection.endingPension)}</td>
                          <td className="p-2 text-right">{formatCurrency(projection.monthlyPension)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Projections assume a {colaInfo.currentRate} annual COLA rate. Actual rates may vary based on
                    legislative decisions and economic conditions.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                COLA Policy Scenarios
              </CardTitle>
              <CardDescription>
                Comparison of current COLA structure vs. potential policy changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Structure</h4>
                  <div className="space-y-1 text-sm">
                    <div>Rate: 3%</div>
                    <div>Base: $13,000</div>
                    <div className="font-semibold text-gray-700">
                      10-Year Total: {formatCurrency(colaScenarios?.comparison?.currentTotal)}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Increased Base Scenario</h4>
                  <div className="space-y-1 text-sm">
                    <div>Rate: 3%</div>
                    <div>Base: $20,000</div>
                    <div className="font-semibold text-blue-700">
                      10-Year Total: {formatCurrency(colaScenarios?.comparison?.increasedBaseTotal)}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Increased Rate Scenario</h4>
                  <div className="space-y-1 text-sm">
                    <div>Rate: 3.5%</div>
                    <div>Base: $13,000</div>
                    <div className="font-semibold text-green-700">
                      10-Year Total: {formatCurrency(colaScenarios?.comparison?.increasedRateTotal)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Legislative Context
                </h4>
                <div className="space-y-2 text-sm">
                  {colaInfo.legislativeContext.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Disclaimer:</strong> These scenarios are hypothetical and for illustration purposes only.
                  Any changes to COLA structure would require legislative approval and are not guaranteed.
                </AlertDescription>
              </Alert>

              {/* Enhanced Projection Notice */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Enhanced Retirement Benefits Projection
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        For a comprehensive year-by-year breakdown including benefit factor progression,
                        COLA adjustments, and Social Security integration, use our Combined Calculation Wizard.
                      </p>
                      <Link
                        href="/wizard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Calculator className="h-4 w-4" />
                        Try the Combined Wizard
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AdSense Ad for Free Users / Premium Alternative */}
      <div className="mt-8">
        <ResponsiveAd className="flex justify-center" />
        <PremiumAlternative />
      </div>
    </motion.div>
  )
}
