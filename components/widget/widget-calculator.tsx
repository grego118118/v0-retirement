"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ExternalLink, TrendingUp, Clock, Users } from "lucide-react"
import { getBenefitFactor, checkEligibility, calculatePensionWithOption } from "@/lib/pension-calculations"
import { getWidgetAnalytics } from "@/lib/widget-analytics"

interface WidgetConfig {
  theme?: "light" | "dark" | "auto"
  accentColor?: string
  defaultGroup?: string
  lockGroup?: boolean
  partnerId?: string
  ctaUrl?: string
  ctaText?: string
  showBranding?: boolean
  size?: "compact" | "standard" | "full"
}

interface WidgetCalculatorProps {
  config: WidgetConfig
}

interface CalculationResult {
  monthlyPension: number
  annualPension: number
  eligible: boolean
  eligibilityMessage: string
  benefitFactor: number
  retirementAge: number
  optionDescription?: string
  survivorPension?: number
}

const RETIREMENT_OPTIONS = [
  { value: "A", label: "Option A", description: "Full benefit, no survivor" },
  { value: "B", label: "Option B", description: "Annuity protection" },
  { value: "C", label: "Option C", description: "66.67% survivor benefit" },
]

const GROUP_OPTIONS = [
  { value: "GROUP_1", label: "Group 1 - General Employees" },
  { value: "GROUP_2", label: "Group 2 - Probation/Court Officers" },
  { value: "GROUP_3", label: "Group 3 - State Police" },
  { value: "GROUP_4", label: "Group 4 - Police/Fire/Corrections" },
]

const GROUP_MIN_AGES: Record<string, number> = {
  GROUP_1: 60,
  GROUP_2: 55,
  GROUP_3: 45,
  GROUP_4: 50,
}

export default function WidgetCalculator({ config }: WidgetCalculatorProps) {
  const [age, setAge] = useState("")
  const [yearsOfService, setYearsOfService] = useState("")
  const [salary, setSalary] = useState("")
  const [group, setGroup] = useState(config.defaultGroup || "")
  const [retirementOption, setRetirementOption] = useState("A")
  const [beneficiaryAge, setBeneficiaryAge] = useState("")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const hasTrackedLoad = useRef(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const ctaUrl = config.ctaUrl || "/calculator"
  const ctaText = config.ctaText || "Full Analysis"
  const showBranding = config.showBranding !== false

  // Track widget load on mount
  useEffect(() => {
    if (!hasTrackedLoad.current) {
      hasTrackedLoad.current = true
      try {
        const analytics = getWidgetAnalytics()
        analytics?.trackLoad({
          partnerId: config.partnerId,
          theme: config.theme,
          group: config.defaultGroup,
        })
      } catch (e) {
        // Silent fail for analytics
      }
    }
  }, [config.partnerId, config.theme, config.defaultGroup])

  // Build CTA URL with form data pre-filled
  const buildCtaUrlWithData = useCallback(() => {
    // Use relative URL for same-origin, or configured ctaUrl for cross-origin
    const baseUrl = ctaUrl || "/calculator"

    // Build URL - for relative paths, use window.location.origin as base
    const url = baseUrl.startsWith("http")
      ? new URL(baseUrl)
      : new URL(baseUrl, window.location.origin)

    // Add form data as query params
    if (group) url.searchParams.set("group", group.replace("GROUP_", ""))
    if (age) url.searchParams.set("age", age)
    if (yearsOfService) url.searchParams.set("yos", yearsOfService)
    if (salary) url.searchParams.set("salary", salary.replace(/[,$]/g, ""))
    if (retirementOption) url.searchParams.set("option", retirementOption)
    if (beneficiaryAge && retirementOption === "C") {
      url.searchParams.set("beneficiaryAge", beneficiaryAge)
    }
    // Mark as coming from widget
    url.searchParams.set("from", "widget")
    if (config.partnerId) url.searchParams.set("partner", config.partnerId)

    return url.toString()
  }, [ctaUrl, group, age, yearsOfService, salary, retirementOption, beneficiaryAge, config.partnerId])

  const handleCtaClick = useCallback(() => {
    try {
      const analytics = getWidgetAnalytics()
      analytics?.trackCtaClick({
        partnerId: config.partnerId,
        ctaUrl: buildCtaUrlWithData(),
      })
    } catch (e) {
      // Silent fail
    }
  }, [config.partnerId, buildCtaUrlWithData])

  const handleCalculate = useCallback(() => {
    const ageNum = parseInt(age)
    const yosNum = parseFloat(yearsOfService)
    const salaryNum = parseFloat(salary.replace(/[,$]/g, ""))

    if (!ageNum || !yosNum || !salaryNum || !group) {
      return
    }

    // For Option C, beneficiary age is required
    if (retirementOption === "C" && !beneficiaryAge) {
      return
    }

    setIsCalculating(true)

    // Simulate brief calculation delay for UX
    setTimeout(() => {
      const serviceEntry = "before_2012" // Default assumption
      const eligibility = checkEligibility(ageNum, yosNum, group, serviceEntry)
      const benefitFactor = getBenefitFactor(ageNum, group, serviceEntry, yosNum)

      let basePension = 0
      if (eligibility.eligible && benefitFactor > 0) {
        const totalPercentage = Math.min(benefitFactor * yosNum, 0.8)
        basePension = salaryNum * totalPercentage
      }

      // Apply retirement option (A, B, C)
      const optionResult = calculatePensionWithOption(
        basePension,
        retirementOption,
        ageNum,
        beneficiaryAge,
        group
      )

      const calcResult = {
        monthlyPension: optionResult.pension / 12,
        annualPension: optionResult.pension,
        eligible: eligibility.eligible,
        eligibilityMessage: eligibility.message || "",
        benefitFactor,
        retirementAge: ageNum,
        optionDescription: optionResult.description,
        survivorPension: optionResult.survivorPension,
      }

      setResult(calcResult)
      setIsCalculating(false)

      // Auto-scroll to results after a brief delay for render
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
      }, 100)

      // Track calculation
      try {
        const analytics = getWidgetAnalytics()
        analytics?.trackCalculation({
          partnerId: config.partnerId,
          retirementGroup: group,
          retirementAge: ageNum,
          yearsOfService: yosNum,
          estimatedPension: optionResult.pension,
          eligible: eligibility.eligible,
        })
      } catch (e) {
        // Silent fail for analytics
      }
    }, 300)
  }, [age, yearsOfService, salary, group, retirementOption, beneficiaryAge, config.partnerId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isFormValid = age && yearsOfService && salary && group &&
    (retirementOption !== "C" || beneficiaryAge)

  return (
    <Card className={`w-full shadow-lg ${config.theme === "dark" ? "dark" : ""}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          MA Pension Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="widget-age" className="text-sm">Retirement Age</Label>
            <Input
              id="widget-age"
              type="number"
              placeholder="e.g., 62"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={45}
              max={75}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="widget-yos" className="text-sm">Years of Service</Label>
            <Input
              id="widget-yos"
              type="number"
              placeholder="e.g., 25"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
              min={0}
              max={50}
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="widget-salary" className="text-sm">Avg. Highest 3-Year Salary</Label>
          <Input
            id="widget-salary"
            type="text"
            placeholder="e.g., $75,000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="h-9"
          />
        </div>

        {!config.lockGroup && (
          <div className="space-y-1.5">
            <Label htmlFor="widget-group" className="text-sm">Retirement Group</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger id="widget-group" className="h-9">
                <SelectValue placeholder="Select your group" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Retirement Option */}
        <div className="space-y-1.5">
          <Label htmlFor="widget-option" className="text-sm flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Retirement Option
          </Label>
          <Select value={retirementOption} onValueChange={setRetirementOption}>
            <SelectTrigger id="widget-option" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETIREMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-muted-foreground ml-1">- {opt.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Beneficiary Age (only for Option C) */}
        {retirementOption === "C" && (
          <div className="space-y-1.5">
            <Label htmlFor="widget-beneficiary-age" className="text-sm">Beneficiary Age</Label>
            <Input
              id="widget-beneficiary-age"
              type="number"
              placeholder="e.g., 60"
              value={beneficiaryAge}
              onChange={(e) => setBeneficiaryAge(e.target.value)}
              min={30}
              max={100}
              className="h-9"
            />
          </div>
        )}

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={!isFormValid || isCalculating}
          className="w-full"
          size="lg"
        >
          {isCalculating ? "Calculating..." : "Calculate My Pension"}
        </Button>

        {/* Results Section */}
        {result && (
          <div ref={resultsRef} className="mt-4 pt-4 border-t space-y-3">
            {result.eligible ? (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Pension</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(result.monthlyPension)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ({formatCurrency(result.annualPension)}/year)
                  </p>
                </div>

                {/* Show survivor pension for Option C */}
                {retirementOption === "C" && result.survivorPension && result.survivorPension > 0 && (
                  <div className="text-center bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Survivor Benefit (66.67%)</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(result.survivorPension / 12)}/mo
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Factor: {(result.benefitFactor * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Option {retirementOption}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild onClick={handleCtaClick}>
                    <a href={buildCtaUrlWithData()} target="_blank" rel="noopener noreferrer">
                      {ctaText}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-amber-600 dark:text-amber-500 font-medium">
                  Not Yet Eligible
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.eligibilityMessage || `Minimum age for ${group.replace("_", " ")} is ${GROUP_MIN_AGES[group] || 60}`}
                </p>
                <Button variant="link" size="sm" className="mt-2" asChild onClick={handleCtaClick}>
                  <a href={buildCtaUrlWithData()} target="_blank" rel="noopener noreferrer">
                    See full eligibility requirements
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Branding Footer */}
        {showBranding && (
          <div className="pt-3 mt-3 border-t text-center">
            <a
              href="https://www.masspension.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Powered by MassPension.com
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

