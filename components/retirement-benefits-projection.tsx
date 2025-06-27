/**
 * Retirement Benefits Projection Component
 * Displays comprehensive year-by-year breakdown of retirement benefits
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react"
import { ProjectionYear, getProjectionSummary } from "@/lib/retirement-benefits-projection"

interface RetirementBenefitsProjectionProps {
  projectionYears: ProjectionYear[]
  pensionRetirementAge: number
  socialSecurityClaimingAge: number
  className?: string
}

export function RetirementBenefitsProjection({
  projectionYears,
  pensionRetirementAge,
  socialSecurityClaimingAge,
  className = ""
}: RetirementBenefitsProjectionProps) {
  if (!projectionYears || projectionYears.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Retirement Benefits Projection
          </CardTitle>
          <CardDescription>
            Complete your retirement information to see year-by-year benefit projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projection data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const summary = getProjectionSummary(projectionYears)
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Retirement Benefits Projection
        </CardTitle>
        <CardDescription>
          Year-by-year breakdown showing pension benefit progression, COLA adjustments, and Social Security integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  Initial Monthly Pension
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${summary.initialMonthlyPension.toLocaleString()}
                </div>
                <div className="text-xs text-green-600">
                  Age {summary.startAge}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Peak Monthly Income
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ${summary.peakMonthlyIncome.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">
                  Pension + Social Security
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Total COLA Benefit
                </div>
                <div className="text-lg font-bold text-purple-600">
                  ${summary.totalCOLABenefit.toLocaleString()}
                </div>
                <div className="text-xs text-purple-600">
                  Cumulative increase
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Projection Years
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {summary.totalProjectionYears}
                </div>
                <div className="text-xs text-orange-600">
                  Ages {summary.startAge}-{summary.endAge}
                </div>
              </div>
            </div>
          )}

          {/* 80% Cap Warning */}
          {summary?.cappedAt80Percent && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800 dark:text-amber-200">
                    80% Benefit Cap Applied
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Your pension benefits are capped at 80% of your average salary. Additional years of service beyond the cap will not increase your base pension, but COLA adjustments will continue to apply.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projection Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Age</TableHead>
                  <TableHead className="font-medium">Y.O.S.</TableHead>
                  <TableHead className="font-medium">Factor</TableHead>
                  <TableHead className="font-medium text-right">Base Pension</TableHead>
                  <TableHead className="font-medium text-right">COLA Adj.</TableHead>
                  <TableHead className="font-medium text-right">Total Pension</TableHead>
                  <TableHead className="font-medium text-right">Social Security</TableHead>
                  <TableHead className="font-medium text-right">Combined Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectionYears.map((year) => (
                  <TableRow
                    key={year.age}
                    className={`hover:bg-muted/50 ${
                      year.age === pensionRetirementAge || year.age === socialSecurityClaimingAge
                        ? 'bg-blue-50 dark:bg-blue-950/20 font-semibold'
                        : ''
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {year.age}
                        {year.age === pensionRetirementAge && (
                          <Badge variant="outline" className="text-xs">Pension</Badge>
                        )}
                        {year.age === socialSecurityClaimingAge && (
                          <Badge variant="outline" className="text-xs">SS</Badge>
                        )}
                        {year.cappedAt80Percent && (
                          <Badge variant="secondary" className="text-xs">Cap</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{year.yearsOfService.toFixed(1)}</TableCell>
                    <TableCell>{(year.benefitFactor * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        <div className="font-medium">${year.pensionWithOption.toLocaleString()}</div>
                        <div className="text-muted-foreground">${(year.pensionWithOption / 12).toLocaleString()}/mo</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-purple-600">
                      {year.colaAdjustment > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium">+${year.colaAdjustment.toLocaleString()}</div>
                          <div className="text-muted-foreground">+${(year.colaAdjustment / 12).toLocaleString()}/mo</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      <div className="text-sm">
                        <div className="font-medium">${year.totalPensionAnnual.toLocaleString()}</div>
                        <div className="text-muted-foreground">${year.totalPensionMonthly.toLocaleString()}/mo</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      {year.socialSecurityAnnual > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium">${year.socialSecurityAnnual.toLocaleString()}</div>
                          <div className="text-muted-foreground">${year.socialSecurityMonthly.toLocaleString()}/mo</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <div className="text-sm">
                        <div className="font-bold">${year.combinedTotalAnnual.toLocaleString()}</div>
                        <div className="text-muted-foreground">${year.combinedTotalMonthly.toLocaleString()}/mo</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Pension Benefits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>COLA Adjustments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Social Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Pension</Badge>
              <span>Pension starts</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">SS</Badge>
              <span>Social Security starts</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Cap</Badge>
              <span>80% benefit cap applied</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
