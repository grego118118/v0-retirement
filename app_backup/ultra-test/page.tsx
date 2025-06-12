"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UltraTestPage() {
  const [selectedValue, setSelectedValue] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev.slice(-4), logMessage]) // Keep last 5 logs
    console.log(logMessage)
  }

  useEffect(() => {
    addLog("Component mounted")
  }, [])

  const handleValueChange = (value: string) => {
    addLog(`Value changed to: ${value}`)
    setSelectedValue(value)
  }

  const handleTriggerClick = () => {
    addLog("Trigger clicked")
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Ultra Simple Select Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Select Component
            </label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Click to select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
                <SelectItem value="option4">Option 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Selected Value:</strong> {selectedValue || "None"}
            </p>
          </div>
          
          <div className="mt-4">
            <button 
              onClick={() => setSelectedValue("option1")}
              className="mr-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Set Option 1
            </button>
            <button 
              onClick={() => setSelectedValue("")}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500">
          <p>This is a minimal test to verify Select component functionality.</p>
          <p>If this doesn't work, the issue is with the Select component itself.</p>
        </div>
      </div>
    </div>
  )
}
