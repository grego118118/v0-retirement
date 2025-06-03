"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Target, 
  BarChart3, 
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"
import { CombinedCalculationData, OptimizationResult } from "@/lib/wizard/wizard-types"

interface OptimizationStepProps {
  data: CombinedCalculationData
  results: OptimizationResult | null
  isCalculating: boolean
  onComplete: (data: { optimizationResults: OptimizationResult }) => void
}

export function OptimizationStep({ data, results, isCalculating, onComplete }: OptimizationStepProps) {
  const [selectedScenario, setSelectedScenario] = useState<number>(0)

  useEffect(() => {
    if (results) {
      onComplete({ optimizationResults: results })
    }
  }, [results])

  if (isCalculating) {
    return (
      <div className="space-y-6">
        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Analyzing your retirement strategy... This may take a moment.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg">Running optimization analysis...</div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground">• Calculating optimal claiming strategies</div>
              <div className="text-sm text-muted-foreground">• Analyzing break-even points</div>
              <div className="text-sm text-muted-foreground">• Computing tax implications</div>
              {data.preferences.includeMonteCarloAnalysis && (
                <div className="text-sm text-muted-foreground">• Running Monte Carlo simulation</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Optimization analysis not yet available. Please complete previous steps.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Analysis complete! Review your optimized retirement strategy below.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
          <TabsTrigger value="tax">Tax Analysis</TabsTrigger>
        </TabsList>

        {/* Recommended Strategy */}
        <TabsContent value="recommended" className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Recommended Strategy
              </CardTitle>
              <CardDescription>
                Optimized for maximum lifetime benefits and your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Optimal Claiming Ages:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pension:</span>
                        <Badge variant="secondary">Age {results.recommendedStrategy.pensionClaimingAge}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Security:</span>
                        <Badge variant="secondary">Age {results.recommendedStrategy.socialSecurityClaimingAge}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Monthly Income:</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.round(results.recommendedStrategy.monthlyRetirementIncome).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${Math.round(results.recommendedStrategy.netAfterTaxIncome).toLocaleString()} after taxes
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Lifetime Benefits:</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      ${Math.round(results.recommendedStrategy.totalLifetimeBenefits).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total projected lifetime income
                    </div>
                  </div>

                  {data.preferences.retirementIncomeGoal > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Goal Achievement:</h4>
                      <div className={`text-lg font-semibold ${
                        results.recommendedStrategy.monthlyRetirementIncome >= data.preferences.retirementIncomeGoal
                          ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {results.recommendedStrategy.monthlyRetirementIncome >= data.preferences.retirementIncomeGoal
                          ? '✓ Goal Achieved' : '⚠ Below Goal'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: ${data.preferences.retirementIncomeGoal.toLocaleString()}/month
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alternative Scenarios */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Alternative Scenarios
              </CardTitle>
              <CardDescription>
                Compare different claiming strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.alternativeScenarios.map((scenario, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedScenario === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedScenario(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant="outline">
                        Pension: {scenario.pensionAge} | SS: {scenario.ssAge}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Monthly:</span>
                        <div className="font-semibold">${Math.round(scenario.monthlyIncome).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Net:</span>
                        <div className="font-semibold">${Math.round(scenario.netIncome).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lifetime:</span>
                        <div className="font-semibold">${Math.round(scenario.lifetimeBenefits).toLocaleString()}</div>
                      </div>
                    </div>
                    {scenario.tradeoffs.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">Tradeoffs:</div>
                        <ul className="text-xs text-muted-foreground">
                          {scenario.tradeoffs.map((tradeoff, i) => (
                            <li key={i}>• {tradeoff}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Break-Even Analysis */}
        <TabsContent value="breakeven" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Break-Even Analysis
              </CardTitle>
              <CardDescription>
                When different claiming strategies pay off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Early vs Full Retirement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Break-even age:</span>
                      <Badge variant="secondary">{results.breakEvenAnalysis.earlyVsFullRetirement.breakEvenAge}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      If you live beyond age {results.breakEvenAnalysis.earlyVsFullRetirement.breakEvenAge}, 
                      waiting for full retirement provides more total benefits.
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Full vs Delayed Retirement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Break-even age:</span>
                      <Badge variant="secondary">{results.breakEvenAnalysis.fullVsDelayed.breakEvenAge}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      If you live beyond age {results.breakEvenAnalysis.fullVsDelayed.breakEvenAge}, 
                      delaying to age 70 provides more total benefits.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Analysis */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                Tax Optimization
              </CardTitle>
              <CardDescription>
                Strategies to minimize your tax burden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Current Strategy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Annual Tax:</span>
                      <span>${Math.round(results.taxOptimization.currentStrategy.annualTaxBurden).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effective Rate:</span>
                      <span>{results.taxOptimization.currentStrategy.effectiveTaxRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marginal Rate:</span>
                      <span>{results.taxOptimization.currentStrategy.marginalTaxRate}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Optimized Strategy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Annual Tax:</span>
                      <span className="text-green-600">
                        ${Math.round(results.taxOptimization.optimizedStrategy.annualTaxBurden).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effective Rate:</span>
                      <span className="text-green-600">{results.taxOptimization.optimizedStrategy.effectiveTaxRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potential Savings:</span>
                      <span className="text-green-600 font-semibold">
                        ${Math.round(results.taxOptimization.potentialSavings).toLocaleString()}/year
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {results.taxOptimization.optimizedStrategy.recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recommendations:</h4>
                  <ul className="space-y-2">
                    {results.taxOptimization.optimizedStrategy.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monte Carlo Results */}
          {results.monteCarloResults && (
            <Card>
              <CardHeader>
                <CardTitle>Monte Carlo Analysis</CardTitle>
                <CardDescription>
                  Risk analysis based on {results.monteCarloResults.scenarios} scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(results.monteCarloResults.successRate)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${Math.round(results.monteCarloResults.medianOutcome).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Median Outcome</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      ${Math.round(results.monteCarloResults.worstCase).toLocaleString()} - 
                      ${Math.round(results.monteCarloResults.bestCase).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">90% Range</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Optimization Analysis Complete
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
