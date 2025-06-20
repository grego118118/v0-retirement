import { generateSEOMetadata } from "@/components/seo/metadata"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ExternalLink,
  BookOpen,
  Calculator,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export const metadata = generateSEOMetadata({
  title: "Retirement Planning Workshops & Events | Massachusetts State Employees",
  description:
    "Find retirement planning workshops, seminars, and educational events for Massachusetts state employees. Learn about pension benefits and retirement preparation.",
  path: "/events",
  keywords: [
    "Massachusetts retirement workshops",
    "retirement planning seminars",
    "state employee events",
    "pension education",
    "retirement preparation events",
  ],
})

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planning Workshops & Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Educational events and workshops to help Massachusetts state employees plan for retirement
          </p>
        </div>

        {/* Quick Info Alert */}
        <div className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Official Retirement Seminars</h3>
                  <p className="text-blue-800 text-sm">
                    For official retirement seminars hosted by the Massachusetts State Retirement Board, 
                    please visit the official state website. Our events complement but do not replace official guidance.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <a href="https://www.mass.gov/service-details/attend-a-seminar" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official State Seminars
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Educational Workshops
                </CardTitle>
                <CardDescription>Learn retirement planning basics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Understanding retirement groups</li>
                  <li>• Benefit calculation methods</li>
                  <li>• Social Security coordination</li>
                  <li>• Healthcare in retirement</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Calculator Training
                </CardTitle>
                <CardDescription>Master our planning tools</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Using the pension calculator</li>
                  <li>• Combined planning wizard</li>
                  <li>• Scenario comparison</li>
                  <li>• Optimization strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Group Sessions
                </CardTitle>
                <CardDescription>Interactive planning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Q&A with experts</li>
                  <li>• Peer discussions</li>
                  <li>• Case study reviews</li>
                  <li>• Planning best practices</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
          <div className="space-y-6">
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Retirement Planning 101</CardTitle>
                    <CardDescription>Introduction to Massachusetts retirement benefits</CardDescription>
                  </div>
                  <Badge>Virtual</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Coming Soon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">1.5 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">All employees</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Perfect for employees just starting to think about retirement. 
                  Covers the basics of the Massachusetts retirement system, groups, and benefit calculations.
                </p>
                <Button disabled size="sm">
                  Registration Opening Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Advanced Calculator Workshop</CardTitle>
                    <CardDescription>Master our retirement planning tools</CardDescription>
                  </div>
                  <Badge variant="outline">Interactive</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Coming Soon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">2 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Limited to 25</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Hands-on training with our pension calculator and combined planning wizard. 
                  Learn to create detailed retirement scenarios and optimize your benefits.
                </p>
                <Button disabled size="sm">
                  Registration Opening Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Social Security & Pension Coordination</CardTitle>
                    <CardDescription>Understanding WEP, GPO, and optimization strategies</CardDescription>
                  </div>
                  <Badge variant="secondary">Expert Led</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Coming Soon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">2.5 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">All levels</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Deep dive into how your Massachusetts pension affects Social Security benefits. 
                  Learn about WEP and GPO provisions and strategies to maximize total retirement income.
                </p>
                <Button disabled size="sm">
                  Registration Opening Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Preparation Materials
                </CardTitle>
                <CardDescription>Get ready for workshops</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/calculator" className="text-blue-600 hover:underline">
                      • Practice with the pension calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/benefits" className="text-blue-600 hover:underline">
                      • Review retirement groups and benefits
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-blue-600 hover:underline">
                      • Read our planning guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-blue-600 hover:underline">
                      • Check frequently asked questions
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                  Official Resources
                </CardTitle>
                <CardDescription>Massachusetts state resources</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a 
                      href="https://www.mass.gov/service-details/attend-a-seminar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      • Official retirement seminars
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.mass.gov/service-details/retirement-benefit-estimation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      • Official benefit estimation
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.ssa.gov/benefits/retirement/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      • Social Security Administration
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Stay Informed</h2>
              <p className="text-purple-100 mb-6">
                Get notified when new workshops and events are scheduled
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Link href="/contact">
                    Subscribe to Updates
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Start Planning Today</h2>
              <p className="text-green-100 mb-6">
                Don't wait for an event - begin your retirement planning now with our free tools
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  <Link href="/calculator">
                    <Calculator className="h-5 w-5 mr-2" />
                    Use Calculator
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Link href="/checklist">
                    View Planning Checklist
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
