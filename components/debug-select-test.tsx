"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function DebugSelectTest() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('')

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value)
  }

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔧 Debug: Select Component Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debug Info */}
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Current State:</h3>
          <p>Selected Group: "{selectedGroup}"</p>
          <p>Selected Option: "{selectedOption}"</p>
        </div>

        {/* Test Retirement Group Select */}
        <div className="space-y-2">
          <Label htmlFor="test-retirement-group">Test Retirement Group</Label>
          <Select
            value={selectedGroup}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger id="test-retirement-group">
              <SelectValue placeholder="Select your retirement group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Group 1 - General Employees</SelectItem>
              <SelectItem value="2">Group 2 - Teachers/Public Safety</SelectItem>
              <SelectItem value="3">Group 3 - State Police</SelectItem>
              <SelectItem value="4">Group 4 - Police/Firefighters</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {selectedGroup ? `Selected: Group ${selectedGroup}` : 'No group selected'}
          </p>
        </div>

        {/* Test Retirement Option Select */}
        <div className="space-y-2">
          <Label htmlFor="test-retirement-option">Test Retirement Option</Label>
          <Select
            value={selectedOption}
            onValueChange={handleOptionChange}
          >
            <SelectTrigger id="test-retirement-option">
              <SelectValue placeholder="Select retirement option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Option A - Maximum Benefit</SelectItem>
              <SelectItem value="B">Option B - 100% Survivor</SelectItem>
              <SelectItem value="C">Option C - 66⅔% Survivor</SelectItem>
              <SelectItem value="D">Option D - 50% Survivor</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {selectedOption ? `Selected: Option ${selectedOption}` : 'No option selected'}
          </p>
        </div>

        {/* Manual Test Buttons */}
        <div className="space-y-2">
          <h3 className="font-medium">Manual Test Buttons:</h3>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => handleGroupChange('1')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Set Group 1
            </button>
            <button 
              onClick={() => handleGroupChange('2')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Set Group 2
            </button>
            <button 
              onClick={() => handleGroupChange('')}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            >
              Clear Group
            </button>
          </div>
        </div>

        {/* CSS Debug Info */}
        <div className="p-4 bg-yellow-50 rounded">
          <h3 className="font-medium mb-2">CSS Debug Info:</h3>
          <p className="text-sm">Check browser console for detailed logs</p>
          <p className="text-sm">Open browser dev tools and inspect the Select elements</p>
          <p className="text-sm">Look for z-index issues or hidden content</p>
        </div>
      </CardContent>
    </Card>
  )
}
