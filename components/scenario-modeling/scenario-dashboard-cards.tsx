"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Plus, 
  Eye, 
  Calculator, 
  Target, 
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
// import { motion } from "framer-motion"

interface ScenarioDashboardCardsProps {
  onCreateScenario: () => void
  onViewScenarios: () => void
}

interface ScenarioSummary {
  id: string
  name: string
  status: 'draft' | 'completed' | 'archived'
  createdAt: string
  estimatedBenefit: number
  retirementAge: number
}

export function ScenarioDashboardCards({ 
  onCreateScenario, 
  onViewScenarios 
}: ScenarioDashboardCardsProps) {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading scenarios from storage/API
    const loadScenarios = async () => {
      try {
        // In a real app, this would fetch from an API or local storage
        const mockScenarios: ScenarioSummary[] = [
          {
            id: '1',
            name: 'Early Retirement at 62',
            status: 'completed',
            createdAt: '2024-01-15',
            estimatedBenefit: 45000,
            retirementAge: 62
          },
          {
            id: '2', 
            name: 'Standard Retirement at 65',
            status: 'completed',
            createdAt: '2024-01-10',
            estimatedBenefit: 58000,
            retirementAge: 65
          },
          {
            id: '3',
            name: 'Extended Career to 67',
            status: 'draft',
            createdAt: '2024-01-05',
            estimatedBenefit: 62000,
            retirementAge: 67
          }
        ]
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setScenarios(mockScenarios)
      } catch (error) {
        console.error('Error loading scenarios:', error)
      } finally {
        setLoading(false)
      }
    }

    loadScenarios()
  }, [])

  const getStatusIcon = (status: ScenarioSummary['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'archived':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: ScenarioSummary['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Retirement Scenarios</h2>
          <p className="text-muted-foreground">
            Compare different retirement strategies and their projected outcomes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateScenario} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Scenario
          </Button>
          <Button variant="outline" onClick={onViewScenarios} className="gap-2">
            <Eye className="h-4 w-4" />
            View All
          </Button>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario, index) => (
          <div key={scenario.id}>
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {scenario.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Retirement at age {scenario.retirementAge}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${getStatusColor(scenario.status)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(scenario.status)}
                      {scenario.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Annual Benefit</span>
                  <span className="font-semibold text-lg text-green-600">
                    {formatCurrency(scenario.estimatedBenefit)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(scenario.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between group-hover:bg-primary/5"
                    onClick={onViewScenarios}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Details
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Create New Scenario Card */}
        <div>
          <Card 
            className="border-dashed border-2 hover:border-primary/50 transition-colors duration-200 cursor-pointer group"
            onClick={onCreateScenario}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200 mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Create New Scenario</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Model different retirement strategies and compare outcomes
              </p>
              <Button variant="outline" className="gap-2">
                <Calculator className="h-4 w-4" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{scenarios.length}</div>
            <div className="text-sm text-muted-foreground">Total Scenarios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scenarios.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(Math.max(...scenarios.map(s => s.estimatedBenefit)))}
            </div>
            <div className="text-sm text-muted-foreground">Best Outcome</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.min(...scenarios.map(s => s.retirementAge))}
            </div>
            <div className="text-sm text-muted-foreground">Earliest Retirement</div>
          </div>
        </div>
      )}
    </div>
  )
}
