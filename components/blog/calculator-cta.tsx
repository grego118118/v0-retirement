"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ArrowRight, TrendingUp, Shield, Clock } from "lucide-react"

interface CalculatorCTAProps {
  variant?: "default" | "compact" | "featured"
  className?: string
}

export function CalculatorCTA({ variant = "default", className = "" }: CalculatorCTAProps) {
  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 my-8 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-full flex-shrink-0">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Calculate Your Massachusetts Pension Benefits
            </h3>
            <p className="text-gray-600 text-sm">
              Get personalized estimates for your retirement benefits in minutes.
            </p>
          </div>
          <Button asChild className="flex-shrink-0">
            <Link href="/calculator" className="flex items-center gap-2">
              Try Calculator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (variant === "featured") {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg ${className}`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Calculate Your Retirement Benefits
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Get accurate estimates for your Massachusetts state pension and plan your retirement with confidence.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Accurate Estimates</h4>
              <p className="text-gray-600 text-xs">Based on current MA retirement laws</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Secure & Private</h4>
              <p className="text-gray-600 text-xs">Your data stays on your device</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Quick Results</h4>
              <p className="text-gray-600 text-xs">Get estimates in under 5 minutes</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Link href="/calculator" className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Start Free Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              100% free • No registration required • Instant results
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="p-4 bg-blue-600 rounded-full">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Calculate Your Retirement Benefits?
            </h3>
            <p className="text-gray-600 mb-4">
              Use our free Massachusetts pension calculator to get personalized estimates based on your employment 
              history and retirement goals. Get accurate projections in minutes.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Accurate estimates</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Quick results</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/calculator" className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Try Free Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
