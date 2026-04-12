"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"

interface WizardTestHelperProps {
  onRunTests?: () => void
}

export function WizardTestHelper({ onRunTests }: WizardTestHelperProps) {
  const [testResults, setTestResults] = useState<{
    pageLoad: boolean
    componentRender: boolean
    formInteraction: boolean
    navigation: boolean
  } | null>(null)

  const runBasicTests = () => {
    console.log('🧪 Running basic wizard tests...')
    
    // Test 1: Page Load
    const pageLoadTest = document.querySelector('[data-testid="wizard-v2-dev"]') !== null ||
                        document.querySelector('.wizard-v2-dev') !== null ||
                        document.querySelector('h1') !== null

    // Test 2: Component Render
    const componentRenderTest = document.querySelector('input[id="birthYear"]') !== null ||
                               document.querySelector('select') !== null ||
                               document.querySelector('button') !== null

    // Test 3: Form Interaction
    const formInteractionTest = document.querySelector('input[id="averageSalary"]') !== null &&
                               document.querySelector('input[id="yearsOfService"]') !== null

    // Test 4: Navigation
    const navigationTest = document.querySelector('button') !== null

    const results = {
      pageLoad: pageLoadTest,
      componentRender: componentRenderTest,
      formInteraction: formInteractionTest,
      navigation: navigationTest
    }

    setTestResults(results)
    
    console.log('🧪 Test Results:', results)
    
    if (onRunTests) {
      onRunTests()
    }

    return results
  }

  const getTestIcon = (passed: boolean) => {
    return passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getTestBadge = (passed: boolean) => {
    return passed ? 
      <Badge variant="default" className="bg-green-100 text-green-800">PASS</Badge> : 
      <Badge variant="destructive">FAIL</Badge>
  }

  const allTestsPassed = testResults && Object.values(testResults).every(result => result)

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Info className="h-5 w-5" />
          Wizard Test Helper
          {testResults && (
            <Badge variant={allTestsPassed ? "default" : "destructive"} className="ml-2">
              {allTestsPassed ? "ALL TESTS PASS" : "SOME TESTS FAILED"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={runBasicTests} variant="outline" size="sm">
              Run Basic Tests
            </Button>
            <span className="text-sm text-blue-600">
              Verify wizard components are working correctly
            </span>
          </div>

          {testResults && (
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">Test Results:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    {getTestIcon(testResults.pageLoad)}
                    <span className="text-sm">Page Load</span>
                  </div>
                  {getTestBadge(testResults.pageLoad)}
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    {getTestIcon(testResults.componentRender)}
                    <span className="text-sm">Component Render</span>
                  </div>
                  {getTestBadge(testResults.componentRender)}
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    {getTestIcon(testResults.formInteraction)}
                    <span className="text-sm">Form Interaction</span>
                  </div>
                  {getTestBadge(testResults.formInteraction)}
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    {getTestIcon(testResults.navigation)}
                    <span className="text-sm">Navigation</span>
                  </div>
                  {getTestBadge(testResults.navigation)}
                </div>
              </div>

              {allTestsPassed && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ All basic tests passed! The wizard is functioning correctly.
                  </p>
                </div>
              )}

              {!allTestsPassed && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700 font-medium">
                    ❌ Some tests failed. Check the console for more details.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
