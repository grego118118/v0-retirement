"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calculator,
  TrendingUp,
  Target,
  ArrowLeft,
  Info,
  BookOpen,
  Users,
  BarChart3,
  DollarSign
} from 'lucide-react'
import { EnhancedScenarioManager } from '@/components/scenario-modeling/enhanced-scenario-manager'
import { ScenarioForm } from '@/components/scenario-modeling/scenario-form'
import { ScenarioTemplateSelector } from '@/components/scenario-modeling/scenario-template-selector'
import { GuidedScenarioWizard } from '@/components/scenario-modeling/guided-scenario-wizard'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'
import { useProfile } from '@/contexts/profile-context'
import Link from 'next/link'

export default function ScenariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profile } = useProfile()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showGuidedWizard, setShowGuidedWizard] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<RetirementScenario | null>(null)

  // Redirect to sign in if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleScenarioSelect = (scenario: RetirementScenario) => {
    setSelectedScenario(scenario)
    // Could navigate to a detailed scenario view or open a modal
  }

  const handleCreateFromProfile = () => {
    if (!profile) {
      // Show message to complete profile first
      router.push('/profile?returnTo=/scenarios')
      return
    }
    setShowGuidedWizard(true)
  }

  const handleCreateFromTemplate = (templateId: string, baseName: string) => {
    setShowTemplateSelector(false)
    setShowCreateForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link 
            href="/dashboard" 
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Scenario Modeling</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Retirement Scenario Modeling
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Create, compare, and optimize your retirement strategies
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowTemplateSelector(true)}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              New Scenario
            </Button>

            <Button
              variant="outline"
              onClick={handleCreateFromProfile}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Guided Setup
            </Button>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">What are Scenarios?</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scenarios let you model different retirement strategies by adjusting retirement age, 
                savings rates, and benefit options to find your optimal path.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compare & Optimize</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Side-by-side comparisons help you understand trade-offs between different 
                retirement strategies and identify the best approach for your goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Get Started</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start with a template or create from your profile data. Each scenario 
                includes pension, Social Security, and tax calculations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Alert */}
        {!profile && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Complete your <Link href="/profile" className="font-medium text-blue-600 hover:text-blue-500">profile</Link> first 
              to create scenarios based on your personal information and get more accurate calculations.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {showGuidedWizard ? (
          <GuidedScenarioWizard
            onComplete={(scenario) => {
              setShowGuidedWizard(false)
              setSelectedScenario(scenario)
            }}
            onCancel={() => setShowGuidedWizard(false)}
          />
        ) : showCreateForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
              <CardDescription>
                Configure your retirement scenario parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioForm
                onSave={async (scenarioData) => {
                  // Handle scenario creation
                  setShowCreateForm(false)
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </CardContent>
          </Card>
        ) : showTemplateSelector ? (
          <Card>
            <CardHeader>
              <CardTitle>Choose a Scenario Template</CardTitle>
              <CardDescription>
                Select a template to get started with your new retirement scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioTemplateSelector
                onSelectTemplate={handleCreateFromTemplate}
                onCancel={() => setShowTemplateSelector(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <EnhancedScenarioManager
            onScenarioSelect={handleScenarioSelect}
            onCreateScenario={() => setShowTemplateSelector(true)}
            onViewScenarios={() => {
              // Already on scenarios page, could scroll to scenarios section
            }}
            showComparison={true}
          />
        )}

        {/* User Guide Section */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5" />
              How to Compare Scenarios
            </CardTitle>
            <CardDescription className="text-blue-700">
              Follow these steps to analyze and compare your retirement scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Select Scenarios</h4>
                  <p className="text-sm text-blue-700">
                    Use checkboxes to select 2-5 scenarios you want to compare
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Click Compare</h4>
                  <p className="text-sm text-blue-700">
                    Click the "Compare" button that appears when scenarios are selected
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Analyze Results</h4>
                  <p className="text-sm text-blue-700">
                    View side-by-side comparisons of income, risk, and tax implications
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Optimize Strategy</h4>
                  <p className="text-sm text-blue-700">
                    Use insights to refine your retirement planning approach
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">What You'll See in Comparisons:</h4>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <DollarSign className="h-4 w-4" />
                  Monthly and lifetime income projections
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <BarChart3 className="h-4 w-4" />
                  Risk assessment and replacement ratios
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Calculator className="h-4 w-4" />
                  Tax implications and optimization opportunities
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <TrendingUp className="h-4 w-4" />
                  Interactive charts and detailed breakdowns
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/calculator">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <Calculator className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Pension Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate benefits</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/social-security">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Social Security</h3>
                  <p className="text-sm text-gray-600">Optimize claiming</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tax-calculator">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-medium">Tax Calculator</h3>
                  <p className="text-sm text-gray-600">Plan tax strategy</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <Target className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium">Dashboard</h3>
                  <p className="text-sm text-gray-600">View overview</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
