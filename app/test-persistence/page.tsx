'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const SOCIAL_SECURITY_STORAGE_KEY = "ma-social-security-calculator-data"
const SOCIAL_SECURITY_SESSION_KEY = "ma-social-security-calculator-session"

interface TestData {
  currentAge: number
  retirementAge: number
  estimatedBenefit: number
}

export default function TestPersistencePage() {
  const [data, setData] = useState<TestData>({
    currentAge: 45,
    retirementAge: 67,
    estimatedBenefit: 2500
  })
  const [storageContents, setStorageContents] = useState<{
    session: string | null
    local: string | null
  }>({ session: null, local: null })
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ 
    message: '', 
    type: 'info' 
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
    updateStorageDisplay()
  }, [])

  const loadData = () => {
    try {
      const sessionData = sessionStorage.getItem(SOCIAL_SECURITY_SESSION_KEY)
      const localData = localStorage.getItem(SOCIAL_SECURITY_STORAGE_KEY)
      
      if (sessionData) {
        const parsedData = JSON.parse(sessionData)
        setData(parsedData)
        setStatus({ message: 'Data loaded from session storage!', type: 'success' })
      } else if (localData) {
        const parsedData = JSON.parse(localData)
        setData(parsedData)
        setStatus({ message: 'Data loaded from local storage!', type: 'success' })
      } else {
        setStatus({ message: 'No saved data found.', type: 'info' })
      }
      updateStorageDisplay()
    } catch (error) {
      setStatus({ message: `Error loading data: ${error}`, type: 'error' })
    }
  }

  const saveData = () => {
    try {
      sessionStorage.setItem(SOCIAL_SECURITY_SESSION_KEY, JSON.stringify(data))
      localStorage.setItem(SOCIAL_SECURITY_STORAGE_KEY, JSON.stringify(data))
      setStatus({ message: 'Data saved successfully!', type: 'success' })
      updateStorageDisplay()
    } catch (error) {
      setStatus({ message: `Error saving data: ${error}`, type: 'error' })
    }
  }

  const clearData = () => {
    try {
      sessionStorage.removeItem(SOCIAL_SECURITY_SESSION_KEY)
      localStorage.removeItem(SOCIAL_SECURITY_STORAGE_KEY)
      setData({ currentAge: 45, retirementAge: 67, estimatedBenefit: 2500 })
      setStatus({ message: 'Data cleared successfully!', type: 'success' })
      updateStorageDisplay()
    } catch (error) {
      setStatus({ message: `Error clearing data: ${error}`, type: 'error' })
    }
  }

  const updateStorageDisplay = () => {
    setStorageContents({
      session: sessionStorage.getItem(SOCIAL_SECURITY_SESSION_KEY),
      local: localStorage.getItem(SOCIAL_SECURITY_STORAGE_KEY)
    })
  }

  const handleFieldChange = (field: keyof TestData, value: number) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    // Auto-save on change (like the real component)
    try {
      sessionStorage.setItem(SOCIAL_SECURITY_SESSION_KEY, JSON.stringify(newData))
      localStorage.setItem(SOCIAL_SECURITY_STORAGE_KEY, JSON.stringify(newData))
      updateStorageDisplay()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Security Form Persistence Test</h1>
        <p className="text-muted-foreground">
          Test the localStorage and sessionStorage persistence functionality for the Social Security calculator.
        </p>
      </div>

      {/* Navigation Links */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test the Real Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Link href="/social-security">
            <Button variant="outline">Social Security Calculator Page</Button>
          </Link>
          <Link href="/calculator">
            <Button variant="outline">Main Calculator (with SS tab)</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Form</CardTitle>
          <CardDescription>
            This form uses the same localStorage keys as the real Social Security calculator.
            Values auto-save on change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              value={data.currentAge}
              onChange={(e) => handleFieldChange('currentAge', parseInt(e.target.value) || 0)}
              min="18"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="retirementAge">Planned Retirement Age</Label>
            <Input
              id="retirementAge"
              type="number"
              value={data.retirementAge}
              onChange={(e) => handleFieldChange('retirementAge', parseInt(e.target.value) || 0)}
              min="50"
              max="75"
            />
          </div>

          <div>
            <Label htmlFor="estimatedBenefit">Estimated Monthly Benefit ($)</Label>
            <Input
              id="estimatedBenefit"
              type="number"
              value={data.estimatedBenefit}
              onChange={(e) => handleFieldChange('estimatedBenefit', parseInt(e.target.value) || 0)}
              min="0"
              max="10000"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveData}>Save to Storage</Button>
            <Button onClick={loadData} variant="outline">Load from Storage</Button>
            <Button onClick={clearData} variant="destructive">Clear Storage</Button>
          </div>

          {status.message && (
            <div className={`p-3 rounded-lg ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Contents */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Contents</CardTitle>
          <CardDescription>
            Real-time view of what's stored in browser storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Session Storage</Badge>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
              {storageContents.session || 'No session data'}
            </pre>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Local Storage</Badge>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
              {storageContents.local || 'No local data'}
            </pre>
          </div>

          <Button onClick={updateStorageDisplay} variant="outline" size="sm">
            Refresh Storage Display
          </Button>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Basic Persistence:</strong> Change values above, refresh page, verify values persist</li>
            <li><strong>Cross-Page Persistence:</strong> Set values here, then visit the real calculator pages</li>
            <li><strong>Session vs Local Storage:</strong> Clear session storage in dev tools, refresh to test localStorage fallback</li>
            <li><strong>Auto-save:</strong> Values automatically save as you type (watch storage contents update)</li>
            <li><strong>Clear Function:</strong> Use "Clear Storage" to reset and test default values</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
