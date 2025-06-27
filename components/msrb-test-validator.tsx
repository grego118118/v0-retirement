"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Calculator, Play } from "lucide-react"
import { 
  getBenefitFactor, 
  calculatePensionWithOption, 
  checkEligibility 
} from "@/lib/pension-calculations"

interface MSRBTestResult {
  testName: string
  expected: number
  actual: number
  passed: boolean
  difference: number
  percentDiff: number
}

interface MSRBTestValidatorProps {
  formData?: {
    age: number
    yearsOfService: number
    group: string
    averageSalary: number
    retirementOption: string
    beneficiaryAge?: string
  }
}

export function MSRBTestValidator({ formData }: MSRBTestValidatorProps) {
  const [testResults, setTestResults] = useState<MSRBTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testScenario, setTestScenario] = useState({
    age: 55,
    yearsOfService: 31.0,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    averageSalary: 95000,
    retirementOption: "C",
    beneficiaryAge: "55"
  })

  // MSRB Official Results for validation (updated with corrected values)
  const msrbOfficialResults = {
    optionA: 58900.00,
    optionB: 58311.00,
    optionC: 54747.55,
    survivor: 36498.37
  }

  // Additional test scenarios for comprehensive validation
  const additionalTestScenarios = [
    {
      name: "Scenario 4 (Age 59, 34 YOS, Survivor 57)",
      age: 59,
      yearsOfService: 34,
      group: "GROUP_2",
      serviceEntry: "before_2012",
      averageSalary: 95000,
      beneficiaryAge: "57",
      msrbResults: {
        optionA: 76000.00,
        optionB: 75240.00,
        optionC: 69274.00,
        survivor: 46182.67
      }
    }
  ]

  const runMSRBValidation = async () => {
    setIsRunning(true)
    const results: MSRBTestResult[] = []

    try {
      // Use form data if available, otherwise use test scenario
      const testData = formData ? {
        age: formData.age,
        yearsOfService: formData.yearsOfService,
        group: formData.group,
        serviceEntry: formData.yearsOfService > 30 ? "before_2012" : "after_2012",
        averageSalary: formData.averageSalary,
        retirementOption: formData.retirementOption,
        beneficiaryAge: formData.beneficiaryAge || formData.age.toString()
      } : testScenario

      // Test 1: Eligibility Check
      const eligibility = checkEligibility(testData.age, testData.yearsOfService, testData.group, testData.serviceEntry)
      
      // Test 2: Benefit Factor and Base Pension Calculation
      const benefitFactor = getBenefitFactor(testData.age, testData.group, testData.serviceEntry, testData.yearsOfService)
      let expectedBasePension = testData.averageSalary * testData.yearsOfService * benefitFactor

      // Apply 80% maximum benefit cap (CRITICAL FIX)
      const maxPension = testData.averageSalary * 0.8
      const cappedAt80Percent = expectedBasePension > maxPension
      if (cappedAt80Percent) {
        expectedBasePension = maxPension
      }

      // Determine which MSRB results to use
      const currentMsrbResults = testData.age === 59 && testData.yearsOfService === 34 && testData.beneficiaryAge === "57"
        ? additionalTestScenarios[0].msrbResults
        : msrbOfficialResults

      // Test 3: Option A (Base Pension)
      const optionA = calculatePensionWithOption(expectedBasePension, "A", testData.age, "")
      results.push({
        testName: "Option A (Base Pension)",
        expected: currentMsrbResults.optionA,
        actual: optionA.pension,
        passed: Math.abs(optionA.pension - currentMsrbResults.optionA) < 1,
        difference: optionA.pension - currentMsrbResults.optionA,
        percentDiff: ((optionA.pension - currentMsrbResults.optionA) / currentMsrbResults.optionA) * 100
      })

      // Test 4: Option B
      const optionB = calculatePensionWithOption(expectedBasePension, "B", testData.age, "")
      results.push({
        testName: "Option B (1% Reduction)",
        expected: currentMsrbResults.optionB,
        actual: optionB.pension,
        passed: Math.abs(optionB.pension - currentMsrbResults.optionB) < 1,
        difference: optionB.pension - currentMsrbResults.optionB,
        percentDiff: ((optionB.pension - currentMsrbResults.optionB) / currentMsrbResults.optionB) * 100
      })

      // Test 5: Option C
      const optionC = calculatePensionWithOption(expectedBasePension, "C", testData.age, testData.beneficiaryAge)
      results.push({
        testName: "Option C (Member Benefit)",
        expected: currentMsrbResults.optionC,
        actual: optionC.pension,
        passed: Math.abs(optionC.pension - currentMsrbResults.optionC) < 1,
        difference: optionC.pension - currentMsrbResults.optionC,
        percentDiff: ((optionC.pension - currentMsrbResults.optionC) / currentMsrbResults.optionC) * 100
      })

      // Test 6: Survivor Benefit
      results.push({
        testName: "Option C (Survivor Benefit)",
        expected: currentMsrbResults.survivor,
        actual: optionC.survivorPension,
        passed: Math.abs(optionC.survivorPension - currentMsrbResults.survivor) < 1,
        difference: optionC.survivorPension - currentMsrbResults.survivor,
        percentDiff: ((optionC.survivorPension - currentMsrbResults.survivor) / currentMsrbResults.survivor) * 100
      })

      setTestResults(results)
    } catch (error) {
      console.error('MSRB validation error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            MSRB Calculation Accuracy Validator
          </CardTitle>
          <CardDescription>
            Test your calculations against official Massachusetts State Retirement Board results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Test Scenario</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>Age: {formData?.age || testScenario.age}</div>
                <div>Years of Service: {formData?.yearsOfService || testScenario.yearsOfService}</div>
                <div>Group: {formData?.group || testScenario.group}</div>
                <div>Salary: ${(formData?.averageSalary || testScenario.averageSalary).toLocaleString()}</div>
                <div>Option: {formData?.retirementOption || testScenario.retirementOption}</div>
                <div>Beneficiary Age: {formData?.beneficiaryAge || testScenario.beneficiaryAge}</div>
              </div>
              {/* Show if this is a high-service scenario that triggers 80% cap */}
              {(formData?.yearsOfService || testScenario.yearsOfService) >= 34 && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ High service scenario - 80% benefit cap may apply
                </div>
              )}
            </div>

            <Button 
              onClick={runMSRBValidation} 
              disabled={isRunning}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Validation...' : 'Run MSRB Validation Test'}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Test Results</h4>
                  <Badge variant={passRate === 100 ? "default" : passRate > 80 ? "secondary" : "destructive"}>
                    {passedTests}/{totalTests} Passed ({passRate.toFixed(1)}%)
                  </Badge>
                </div>

                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{result.testName}</div>
                          <div className="text-sm text-muted-foreground">
                            Expected: ${result.expected.toFixed(2)} | 
                            Actual: ${result.actual.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className={result.passed ? "text-green-600" : "text-red-600"}>
                          {result.difference >= 0 ? '+' : ''}${result.difference.toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">
                          {result.percentDiff >= 0 ? '+' : ''}{result.percentDiff.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {passRate === 100 ? (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Perfect Accuracy!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      All calculations match official MSRB results exactly.
                    </p>
                    {(formData?.yearsOfService || testScenario.yearsOfService) >= 34 && (
                      <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
                        ✅ 80% benefit cap correctly applied for high service scenario
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Accuracy Issues Detected</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Some calculations differ from official MSRB results. Review the differences above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
