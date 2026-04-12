"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Info, 
  Calendar,
  FileText,
  Users,
  Gavel
} from "lucide-react"
import { getCOLADisplayInfo, analyzeCOLAImpactByPensionLevel } from "@/lib/pension/ma-cola-calculator"
import { formatCurrency } from "@/lib/utils"

export function COLAHelpComponent() {
  const colaInfo = getCOLADisplayInfo()
  const impactAnalysis = analyzeCOLAImpactByPensionLevel()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Massachusetts Pension COLA Guide</h1>
        <p className="text-muted-foreground">
          Understanding Cost-of-Living Adjustments for MA retirement benefits
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculation">How It Works</TabsTrigger>
          <TabsTrigger value="policy">Policy Context</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                FY2025 COLA Structure
              </CardTitle>
              <CardDescription>
                Current Cost-of-Living Adjustment parameters for Massachusetts pensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{colaInfo.currentRate}</div>
                  <div className="text-sm text-muted-foreground">COLA Rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{colaInfo.baseAmount}</div>
                  <div className="text-sm text-muted-foreground">Base Amount</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">{colaInfo.maxAnnualIncrease}</div>
                  <div className="text-sm text-muted-foreground">Max Annual</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{colaInfo.maxMonthlyIncrease}</div>
                  <div className="text-sm text-muted-foreground">Max Monthly</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Key Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {colaInfo.keyFacts.map((fact, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{fact}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Important Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {colaInfo.warnings.map((warning, index) => (
                    <Alert key={index} className="bg-orange-50 border-orange-200">
                      <AlertDescription className="text-sm">{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                COLA Calculation Method
              </CardTitle>
              <CardDescription>
                Step-by-step breakdown of how COLA is calculated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Step 1: Determine Eligible Amount</h4>
                  <p className="text-sm text-muted-foreground">
                    COLA is applied only to the first $13,000 of your annual pension benefit. 
                    If your pension is less than $13,000, the entire amount is eligible.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Step 2: Apply COLA Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    Multiply the eligible amount by the current COLA rate (3% for FY2025).
                    This gives you your annual COLA increase.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Step 3: Calculate New Pension</h4>
                  <p className="text-sm text-muted-foreground">
                    Add the COLA increase to your original pension amount to get your 
                    adjusted pension for the year.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">Example Calculation</h4>
                <div className="space-y-1 text-sm">
                  <div>Annual Pension: $25,000</div>
                  <div>COLA Eligible Amount: $13,000 (capped)</div>
                  <div>COLA Rate: 3%</div>
                  <div>COLA Increase: $13,000 × 3% = $390</div>
                  <div className="font-semibold border-t pt-1">New Annual Pension: $25,390</div>
                  <div className="text-muted-foreground">Effective COLA Rate: 1.56% of total pension</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-purple-600" />
                Legislative and Policy Context
              </CardTitle>
              <CardDescription>
                Understanding the political and policy aspects of COLA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {colaInfo.legislativeContext.map((item, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{item}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  <strong>Annual Process:</strong> COLA adjustments are typically considered during the 
                  state budget process and become effective July 1st of each fiscal year. The rate and 
                  base amount can vary based on economic conditions and legislative priorities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                COLA Impact by Pension Level
              </CardTitle>
              <CardDescription>
                See how COLA affects different pension amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impactAnalysis.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{example.pensionLevel} Pension</h4>
                        <p className="text-sm text-muted-foreground">{example.description}</p>
                      </div>
                      <Badge variant={example.isAtMaximum ? "default" : "secondary"}>
                        {example.isAtMaximum ? "Max COLA" : "Partial COLA"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Annual Pension</div>
                        <div className="font-semibold">{formatCurrency(example.annualPension)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">COLA Increase</div>
                        <div className="font-semibold text-green-600">{formatCurrency(example.colaIncrease)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Effective Rate</div>
                        <div className="font-semibold">{example.effectiveRate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
