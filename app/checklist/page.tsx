import { generateSEOMetadata } from "@/components/seo/metadata"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Calculator, 
  FileText, 
  DollarSign, 
  Users, 
  Shield,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react"
import Link from "next/link"

export const metadata = generateSEOMetadata({
  title: "Retirement Planning Checklist | Massachusetts State Employee Guide",
  description:
    "Complete retirement planning checklist for Massachusetts state employees. Step-by-step guide to prepare for retirement with timelines and action items.",
  path: "/checklist",
  keywords: [
    "Massachusetts retirement checklist",
    "retirement planning steps",
    "state employee retirement guide",
    "pension planning checklist",
    "MA retirement preparation",
  ],
})

export default function ChecklistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Retirement Planning Checklist
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive guide to help Massachusetts state employees prepare for retirement
          </p>
        </div>

        {/* Timeline Overview */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Planning Timeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">5+ Years Out</h3>
                  <p className="text-sm text-blue-100">Initial Planning</p>
                </div>
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">2-3 Years Out</h3>
                  <p className="text-sm text-blue-100">Detailed Preparation</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">1 Year Out</h3>
                  <p className="text-sm text-blue-100">Final Preparations</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Retirement Year</h3>
                  <p className="text-sm text-blue-100">Execute Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5+ Years Before Retirement */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            5+ Years Before Retirement
          </h2>
          <div className="space-y-4">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Understand Your Retirement Group
                </CardTitle>
                <CardDescription>Determine which group (1-4) you belong to</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Your retirement group determines your benefit multiplier and minimum retirement age.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/benefits">
                      Learn About Groups
                    </Link>
                  </Button>
                  <Badge variant="outline">Essential</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Calculate Initial Estimates
                </CardTitle>
                <CardDescription>Get baseline pension projections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Use our calculator to understand your potential benefits and identify planning gaps.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/calculator">
                      <Calculator className="h-4 w-4 mr-2" />
                      Start Calculator
                    </Link>
                  </Button>
                  <Badge variant="outline">High Priority</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Review Social Security Benefits
                </CardTitle>
                <CardDescription>Understand WEP and GPO impacts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Massachusetts pension may affect your Social Security benefits due to WEP/GPO provisions.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/social-security">
                      Learn About Social Security
                    </Link>
                  </Button>
                  <Badge variant="outline">Important</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 2-3 Years Before Retirement */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-green-600" />
            2-3 Years Before Retirement
          </h2>
          <div className="space-y-4">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Attend Retirement Seminars
                </CardTitle>
                <CardDescription>Get official guidance from retirement board</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Attend official Massachusetts retirement seminars for detailed information and Q&A.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href="https://www.mass.gov/service-details/attend-a-seminar" target="_blank" rel="noopener noreferrer">
                      Find Seminars
                    </a>
                  </Button>
                  <Badge variant="outline">Recommended</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Choose Retirement Option
                </CardTitle>
                <CardDescription>Decide between Options A, B, and C</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Consider your family situation and survivor benefit needs when choosing your retirement option.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/benefits#options">
                      Compare Options
                    </Link>
                  </Button>
                  <Badge variant="outline">Critical Decision</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Plan Healthcare Coverage
                </CardTitle>
                <CardDescription>Understand Medicare and supplemental insurance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Research Medicare enrollment and supplemental insurance options for retirees.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href="https://www.medicare.gov/" target="_blank" rel="noopener noreferrer">
                      Medicare.gov
                    </a>
                  </Button>
                  <Badge variant="outline">Essential</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 1 Year Before Retirement */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            1 Year Before Retirement
          </h2>
          <div className="space-y-4">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Submit Retirement Application
                </CardTitle>
                <CardDescription>File paperwork 90-120 days before retirement date</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Contact your local retirement board to begin the application process.
                </p>
                <div className="flex gap-2">
                  <Badge variant="destructive">Time Sensitive</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Finalize Financial Planning
                </CardTitle>
                <CardDescription>Complete budget and income projections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Create detailed retirement budget including pension, Social Security, and other income sources.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/calculator/combined">
                      Combined Planning Tool
                    </Link>
                  </Button>
                  <Badge variant="outline">High Priority</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Gather Required Documents
                </CardTitle>
                <CardDescription>Collect all necessary paperwork</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Birth certificate, marriage certificate, beneficiary information, and employment records.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Required</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Retirement Year */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-red-600" />
            Retirement Year
          </h2>
          <div className="space-y-4">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Complete Final Paperwork
                </CardTitle>
                <CardDescription>Submit all required forms and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Work with your retirement board to complete all final requirements.
                </p>
                <div className="flex gap-2">
                  <Badge variant="destructive">Critical</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Set Up Direct Deposit
                </CardTitle>
                <CardDescription>Arrange for pension payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Provide banking information for direct deposit of your monthly pension payments.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Required</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-400" />
                  Transition Health Insurance
                </CardTitle>
                <CardDescription>Switch to retiree health coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Coordinate the transition from active employee to retiree health insurance coverage.
                </p>
                <div className="flex gap-2">
                  <Badge variant="destructive">Time Sensitive</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Start Your Retirement Planning Today</h2>
              <p className="text-green-100 mb-6">
                Use our tools and resources to create your personalized retirement plan
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  <Link href="/calculator">
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Benefits
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Link href="/guides">
                    View Planning Guides
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
