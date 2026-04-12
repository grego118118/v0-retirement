'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function TestPDFSimplePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testPDFGeneration = async () => {
    setIsGenerating(true)
    setTestResult(null)
    setError(null)

    try {
      console.log('🧪 Testing PDF generation...')

      // Test data for pension calculation
      const testData = {
        currentAge: 55,
        plannedRetirementAge: 60,
        retirementGroup: 'Group 1',
        serviceEntry: 'before_2012',
        averageSalary: 75000,
        yearsOfService: 25,
        projectedYearsAtRetirement: 30,
        basePension: 45000,
        benefitFactor: 0.025,
        totalBenefitPercentage: 62.5,
        cappedAt80Percent: false,
        options: {
          A: {
            annual: 45000,
            monthly: 3750,
            description: 'Option A: Full Allowance (100%)'
          },
          B: {
            annual: 44550,
            monthly: 3712.50,
            description: 'Option B: Annuity Protection (1% reduction)',
            reduction: 0.01
          },
          C: {
            annual: 41827.50,
            monthly: 3485.63,
            description: 'Option C: Joint & Survivor (66.67%)',
            reduction: 0.0705,
            survivorAnnual: 27885,
            survivorMonthly: 2323.75
          }
        },
        calculationDate: new Date()
      }

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: testData,
          reportType: 'pension',
          options: {
            includeCharts: true,
            includeCOLAProjections: true
          }
        })
      })

      console.log(`Response status: ${response.status}`)

      if (response.status === 401) {
        setTestResult('Authentication required - Please sign in first')
      } else if (response.status === 403) {
        setTestResult('Premium access required - Please upgrade to premium')
      } else if (response.status === 200) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await response.blob()
          setTestResult(`✅ PDF generated successfully! Size: ${blob.size} bytes`)
          
          // Download the PDF
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'test-pension-report.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          const text = await response.text()
          setTestResult(`Unexpected response type: ${contentType}`)
          setError(text)
        }
      } else {
        const text = await response.text()
        setError(`API Error: ${response.status} - ${text}`)
      }

    } catch (error) {
      console.error('PDF generation test failed:', error)
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            PDF Generation Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This page tests the PDF generation functionality for the Massachusetts Retirement System calculator.
          </p>

          <Button 
            onClick={testPDFGeneration}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Test PDF Generation
              </>
            )}
          </Button>

          {testResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{testResult}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>If not signed in: "Authentication required" message</li>
              <li>If signed in but not premium: "Premium access required" message</li>
              <li>If premium user (grego118@gmail.com): PDF should generate and download</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
