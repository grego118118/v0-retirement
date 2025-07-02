"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession, signOut } from 'next-auth/react'
import { PDFExportButton } from '@/components/pdf/pdf-export-button'
import { usePDFGeneration } from '@/hooks/use-pdf-generation'
import { FileText, LogOut, User, Crown } from 'lucide-react'

// Sample pension data for testing
const samplePensionData = {
  averageSalary: 75000,
  yearsOfService: 25,
  retirementAge: 60,
  retirementGroup: '1',
  benefitPercentage: 2.0,
  retirementOption: 'A',
  currentAge: 45,
  membershipDate: new Date('2000-01-01'),
  retirementDate: new Date('2030-01-01')
}

export function PDFRedirectTest() {
  const { data: session, status } = useSession()
  const { generatePensionPDF, hasAccess, isPremium, isLoading } = usePDFGeneration()

  const handleDirectPDFTest = async () => {
    console.log('🧪 Testing direct PDF generation...')
    await generatePensionPDF(samplePensionData, {
      includeCharts: true,
      includeCOLAProjections: true
    })
  }

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Redirect Test Component
          </CardTitle>
          <CardDescription>
            Test the PDF generation redirect functionality for unauthenticated users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <div>
                <p className="font-medium">Authentication Status</p>
                <p className="text-sm text-muted-foreground">
                  {status === 'loading' ? 'Loading...' : 
                   status === 'authenticated' ? `Signed in as ${session?.user?.email}` :
                   'Not signed in'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
                {status}
              </Badge>
              {status === 'authenticated' && (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Premium Status */}
          {status === 'authenticated' && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Premium Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Checking...' : 
                     isPremium ? 'Premium subscriber' : 
                     'Free tier user'}
                  </p>
                </div>
              </div>
              <Badge variant={isPremium ? 'default' : 'secondary'}>
                {isPremium ? 'Premium' : 'Free'}
              </Badge>
            </div>
          )}

          {/* Test Instructions */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">Test Instructions</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>If signed out:</strong> PDF buttons should redirect to pricing page</li>
              <li>• <strong>If signed in (free):</strong> PDF buttons should show upgrade prompt</li>
              <li>• <strong>If signed in (premium):</strong> PDF buttons should generate PDFs</li>
              <li>• Check browser console for redirect logs</li>
            </ul>
          </div>

          {/* PDF Export Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PDF Export Tests</h3>
            
            {/* Component-based PDF Export */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Component-based PDF Export</h4>
              <PDFExportButton
                data={samplePensionData}
                reportType="pension"
                variant="default"
                size="default"
              />
            </div>

            {/* Hook-based PDF Export */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Hook-based PDF Export</h4>
              <Button onClick={handleDirectPDFTest} disabled={isLoading}>
                <FileText className="w-4 h-4 mr-2" />
                Test Direct PDF Generation
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Uses the usePDFGeneration hook directly
              </p>
            </div>
          </div>

          {/* Expected Behavior */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Expected Behavior</h3>
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>Unauthenticated users:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Should be redirected to <code>/pricing?feature=pdf-reports</code></li>
                <li>• Should see "You were trying to access PDF generation" message</li>
                <li>• Should see feature-specific pricing content</li>
              </ul>
              
              <p><strong>Authenticated users (free tier):</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Should see upgrade prompts with link to pricing</li>
                <li>• Should not be redirected away from current page</li>
              </ul>
              
              <p><strong>Authenticated users (premium):</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Should successfully generate and download PDFs</li>
                <li>• Should see success messages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
