"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calculator, GraduationCap, Info, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { calculateMTRSPension, type MTRSResult } from "@/lib/mtrs-calculations"
import { ResultsUpsellSection } from "@/components/calculator/results-email-upsell"

export function MTRSCalculator() {
  const [age, setAge] = useState("")
  const [yearsOfService, setYearsOfService] = useState("")
  const [averageSalary, setAverageSalary] = useState("")
  const [serviceEntry, setServiceEntry] = useState("before_2012")
  const [retirementPlus, setRetirementPlus] = useState(true)
  const [option, setOption] = useState("A")
  const [beneficiaryAge, setBeneficiaryAge] = useState("")
  const [result, setResult] = useState<MTRSResult | null>(null)
  const [inputError, setInputError] = useState("")

  const canSubmit = useMemo(
    () => age !== "" && yearsOfService !== "" && averageSalary !== "",
    [age, yearsOfService, averageSalary]
  )

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    setInputError("")

    const ageNum = parseFloat(age)
    const yosNum = parseFloat(yearsOfService)
    const salaryNum = parseFloat(averageSalary.replace(/[$,]/g, ""))

    if (isNaN(ageNum) || ageNum < 40 || ageNum > 80) {
      setInputError("Please enter a retirement age between 40 and 80.")
      return
    }
    if (isNaN(yosNum) || yosNum <= 0 || yosNum > 50) {
      setInputError("Please enter years of creditable service between 1 and 50.")
      return
    }
    if (isNaN(salaryNum) || salaryNum <= 0) {
      setInputError("Please enter your average highest 3-year salary.")
      return
    }

    setResult(
      calculateMTRSPension({
        age: ageNum,
        yearsOfService: yosNum,
        averageSalary: salaryNum,
        serviceEntry,
        retirementPlus,
        option,
        beneficiaryAge: option === "C" ? beneficiaryAge : undefined,
      })
    )
  }

  return (
    <div className="space-y-8">
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-mrs-blue-600" />
            <CardTitle>MTRS Pension Estimate</CardTitle>
          </div>
          <CardDescription>
            Enter your details to estimate your Massachusetts teacher pension, including the RetirementPlus enhancement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="mtrs-age">Age at retirement</Label>
                <Input
                  id="mtrs-age"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 60"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={40}
                  max={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mtrs-yos">Years of creditable service</Label>
                <Input
                  id="mtrs-yos"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 32"
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(e.target.value)}
                  min={1}
                  max={50}
                  step="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mtrs-salary">Avg. highest 3-year salary</Label>
                <Input
                  id="mtrs-salary"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 85,000"
                  value={averageSalary}
                  onChange={(e) => setAverageSalary(e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>When did you join the retirement system?</Label>
                <Select value={serviceEntry} onValueChange={setServiceEntry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_2012">Before April 2, 2012</SelectItem>
                    <SelectItem value="after_2012">On or after April 2, 2012</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Retirement option</Label>
                <Select value={option} onValueChange={setOption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Option A — full allowance</SelectItem>
                    <SelectItem value="B">Option B — annuity protection</SelectItem>
                    <SelectItem value="C">Option C — joint &amp; survivor (66.67%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {option === "C" && (
              <div className="space-y-1.5 sm:max-w-xs">
                <Label htmlFor="mtrs-ben-age">Beneficiary&rsquo;s age</Label>
                <Input
                  id="mtrs-ben-age"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 58"
                  value={beneficiaryAge}
                  onChange={(e) => setBeneficiaryAge(e.target.value)}
                  min={18}
                  max={90}
                />
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <Switch id="mtrs-rplus" checked={retirementPlus} onCheckedChange={setRetirementPlus} />
              <div>
                <Label htmlFor="mtrs-rplus" className="cursor-pointer">RetirementPlus participant</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mandatory for teachers who joined on or after July 1, 2001 (11% contribution rate). Earlier members
                  participate only if they elected in during 2001.
                </p>
              </div>
            </div>

            {inputError && (
              <Alert className="border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{inputError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="w-full sm:w-auto bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-400 hover:to-mrs-gold-500 text-white font-bold"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate My Teacher Pension
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && !result.eligible && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:border-orange-900/40 dark:text-orange-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{result.eligibilityMessage}</AlertDescription>
        </Alert>
      )}

      {result && result.eligible && result.annualPension > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-mrs-navy-900 dark:text-white mb-1">
              Your Estimated MTRS Pension
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{result.optionDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2" />
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-medium mb-2">Annual Pension</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                  {formatCurrency(result.annualPension)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per year</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2" />
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-medium mb-2">Monthly Pension</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                  {formatCurrency(result.monthlyPension)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per month</p>
              </CardContent>
            </Card>
          </div>

          {result.survivorAnnualPension > 0 && (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2" />
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium text-center mb-3">Survivor Benefit (Option C)</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual</p>
                    <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(result.survivorAnnualPension)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(result.survivorMonthlyPension)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calculation breakdown */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" /> How this was calculated
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base benefit (factor {(result.baseFactor * 100).toFixed(2)}% × years of service)</span>
                  <span className="font-medium">{(result.basePercentage * 100).toFixed(1)}%</span>
                </div>
                {result.retirementPlusApplied && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RetirementPlus bonus (2% × years over 24)</span>
                    <span className="font-medium text-green-600">+{(result.retirementPlusPercentage * 100).toFixed(0)}%</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">
                    Total percentage of salary{result.cappedAt80 && (
                      <Badge variant="outline" className="ml-2 text-xs">capped at 80%</Badge>
                    )}
                  </span>
                  <span className="font-bold">{(result.totalPercentage * 100).toFixed(1)}%</span>
                </div>
              </div>
              {result.optionWarning && (
                <p className="text-xs text-orange-600 mt-3">{result.optionWarning}</p>
              )}
            </CardContent>
          </Card>

          {/* Email capture + report upsell (shared with the state calculator) */}
          <ResultsUpsellSection
            data={{
              annualPension: result.annualPension,
              monthlyPension: result.monthlyPension,
              averageSalary: parseFloat(averageSalary.replace(/[$,]/g, "")) || 0,
              group: "MTRS (Teacher)",
              age: parseFloat(age) || 0,
              yearsOfService: parseFloat(yearsOfService) || 0,
              selectedOption: result.optionDescription,
            }}
            reportData={{
              currentAge: parseFloat(age) || 0,
              plannedRetirementAge: parseFloat(age) || 0,
              retirementGroup: "GROUP_1 (MTRS Teacher)",
              serviceEntry,
              averageSalary: parseFloat(averageSalary.replace(/[$,]/g, "")) || 0,
              yearsOfService: parseFloat(yearsOfService) || 0,
              projectedYearsAtRetirement: parseFloat(yearsOfService) || 0,
              basePension: result.baseAnnualPension,
              benefitFactor: result.baseFactor,
              totalBenefitPercentage: result.totalPercentage,
              cappedAt80Percent: result.cappedAt80,
              options: {
                A: {
                  annual: result.baseAnnualPension,
                  monthly: result.baseAnnualPension / 12,
                  description: "Option A: Full Allowance (100%)",
                },
                B: {
                  annual: result.baseAnnualPension * 0.99,
                  monthly: (result.baseAnnualPension * 0.99) / 12,
                  description: "Option B: Annuity Protection (1% reduction)",
                  reduction: 0.01,
                },
                C: {
                  annual: result.baseAnnualPension * 0.9295,
                  monthly: (result.baseAnnualPension * 0.9295) / 12,
                  description: "Option C: Joint & Survivor (66.67%)",
                  reduction: 0.0705,
                  survivorAnnual: result.baseAnnualPension * 0.9295 * 0.6667,
                  survivorMonthly: (result.baseAnnualPension * 0.9295 * 0.6667) / 12,
                },
              },
              calculationDate: new Date().toISOString(),
            }}
          />
        </div>
      )}
    </div>
  )
}
