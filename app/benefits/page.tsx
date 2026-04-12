import { generateSEOMetadata } from "@/components/seo/metadata"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, Users, DollarSign, Calendar, Shield, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata = generateSEOMetadata({
  title: "Massachusetts Retirement Benefits Information | Pension Groups & Options",
  description:
    "Comprehensive guide to Massachusetts state employee retirement benefits, pension groups, benefit multipliers, COLA adjustments, and retirement options.",
  path: "/benefits",
  keywords: [
    "Massachusetts retirement benefits",
    "state employee pension",
    "retirement groups",
    "pension multipliers",
    "COLA adjustments",
    "retirement options",
    "MA state benefits",
  ],
})

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Massachusetts Retirement Benefits
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding your pension benefits, retirement groups, and options as a Massachusetts state employee
          </p>
        </div>

        {/* Quick Calculator CTA */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <Calculator className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Calculate Your Benefits</h2>
              <p className="text-blue-100 mb-6">
                Get personalized estimates for your Massachusetts retirement benefits
              </p>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/calculator">
                  Start Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Retirement Groups */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Retirement Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Group 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Group 1
                </CardTitle>
                <CardDescription>General Employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Most Common</Badge>
                    <p className="text-sm text-gray-600">
                      General state employees, teachers, and most public workers
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-semibold text-sm">Benefit Multiplier:</p>
                    <p className="text-sm">2.0% at age 60, increases 0.1% yearly to 2.5% at age 65</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Group 2
                </CardTitle>
                <CardDescription>Probation & Court Officers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Specialized</Badge>
                    <p className="text-sm text-gray-600">
                      Probation officers, court officers, certain corrections
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-semibold text-sm">Benefit Multiplier:</p>
                    <p className="text-sm">2.0% at age 55, increases 0.1% yearly to 2.5% at age 60</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  Group 3
                </CardTitle>
                <CardDescription>State Police</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Premium</Badge>
                    <p className="text-sm text-gray-600">
                      Massachusetts State Police officers
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-semibold text-sm">Benefit Multiplier:</p>
                    <p className="text-sm">Flat 2.5% - can retire at any age with 20+ years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group 4 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Group 4
                </CardTitle>
                <CardDescription>Public Safety</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Public Safety</Badge>
                    <p className="text-sm text-gray-600">
                      Corrections, parole officers, public safety
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-semibold text-sm">Benefit Multiplier:</p>
                    <p className="text-sm">2.0% at age 50, increases 0.1% yearly to 2.5% at age 55</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* COLA Information */}
        <div className="mb-12">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Cost of Living Adjustments (COLA)
              </CardTitle>
              <CardDescription>Annual benefit increases for retirees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">FY2025 COLA Structure</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      3% rate applied to first $13,000 of annual retirement allowance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Maximum annual increase: $390 ($32.50/month)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Subject to annual legislative approval
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Important Notes</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• COLA applies only to the first $13,000 of your annual benefit</li>
                    <li>• Higher benefits receive the same maximum $390 increase</li>
                    <li>• COLA rates may change based on legislative action</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retirement Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Retirement Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Option A</CardTitle>
                <CardDescription>Maximum Benefit</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Highest monthly benefit with no survivor protection
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Maximum monthly payment</li>
                  <li>• Benefits end at death</li>
                  <li>• No survivor benefits</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Option B</CardTitle>
                <CardDescription>Joint & Survivor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Reduced benefit with survivor protection
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Lower monthly payment</li>
                  <li>• Survivor receives same amount</li>
                  <li>• Lifetime protection for spouse</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Option C</CardTitle>
                <CardDescription>Modified Joint & Survivor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Moderate reduction with partial survivor benefit
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Moderate monthly payment</li>
                  <li>• Survivor receives 66.67%</li>
                  <li>• Balance of protection and income</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Plan Your Retirement?</h2>
              <p className="text-purple-100 mb-6">
                Use our comprehensive calculator to estimate your Massachusetts retirement benefits
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Link href="/calculator">
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Benefits
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <Link href="/guides">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
