"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfile } from "@/contexts/profile-context"
import { DollarSign, User, Target } from "lucide-react"

export default function TestProfileSyncPage() {
  const { profile, updateProfile, loading } = useProfile()
  const [testData, setTestData] = useState({
    dateOfBirth: '1980-01-01',
    membershipDate: '2010-01-01',
    currentSalary: 75000,
    retirementGroup: 'Group 1',
    yearsOfService: 14
  })

  const handleTestUpdate = async (field: string, value: any) => {
    console.log(`🧪 Testing update: ${field} = ${value}`)
    
    const updates = { [field]: value }
    setTestData(prev => ({ ...prev, ...updates }))
    
    // Test the ProfileContext update
    const success = await updateProfile(updates)
    console.log(`🧪 Update result: ${success ? 'SUCCESS' : 'FAILED'}`)
  }

  const handleBulkUpdate = async () => {
    console.log('🧪 Testing bulk update with:', testData)
    const success = await updateProfile(testData)
    console.log(`🧪 Bulk update result: ${success ? 'SUCCESS' : 'FAILED'}`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Sync Test Page</h1>
        <p className="text-muted-foreground">
          Test real-time profile data synchronization between form inputs and dashboard display
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>Test Profile Updates</CardTitle>
            <CardDescription>
              Make changes here and watch the dashboard cards update in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={testData.dateOfBirth}
                onChange={(e) => handleTestUpdate('dateOfBirth', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="membershipDate">Membership Date</Label>
              <Input
                id="membershipDate"
                type="date"
                value={testData.membershipDate}
                onChange={(e) => handleTestUpdate('membershipDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="currentSalary">Current Salary</Label>
              <Input
                id="currentSalary"
                type="number"
                value={testData.currentSalary}
                onChange={(e) => handleTestUpdate('currentSalary', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="retirementGroup">Retirement Group</Label>
              <Select
                value={testData.retirementGroup}
                onValueChange={(value) => handleTestUpdate('retirementGroup', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Group 1">Group 1</SelectItem>
                  <SelectItem value="Group 2">Group 2</SelectItem>
                  <SelectItem value="Group 3">Group 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="yearsOfService">Years of Service</Label>
              <Input
                id="yearsOfService"
                type="number"
                step="0.1"
                value={testData.yearsOfService}
                onChange={(e) => handleTestUpdate('yearsOfService', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <Button onClick={handleBulkUpdate} className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Test Bulk Update'}
            </Button>
          </CardContent>
        </Card>

        {/* Dashboard Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Data (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Date of Birth</div>
                <div className="font-medium">{profile?.dateOfBirth || 'Not set'}</div>
                
                <div className="text-sm text-muted-foreground">Membership Date</div>
                <div className="font-medium">{profile?.membershipDate || 'Not set'}</div>
                
                <div className="text-sm text-muted-foreground">Retirement Group</div>
                <div className="font-medium">{profile?.retirementGroup || 'Not set'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Employment Data (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Current Salary</div>
                <div className="font-medium">
                  {profile?.currentSalary ? `$${profile.currentSalary.toLocaleString()}` : 'Not set'}
                </div>
                
                <div className="text-sm text-muted-foreground">Years of Service</div>
                <div className="font-medium">{profile?.yearsOfService || 0} years</div>
                
                <div className="text-sm text-muted-foreground">Benefit Percentage</div>
                <div className="font-medium">
                  {profile?.retirementGroup === 'Group 1' ? '2.0%' : '2.5%'} per year
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Context State Debug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded">
                <pre>{JSON.stringify(profile, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
