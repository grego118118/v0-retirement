import { generateSEOMetadata } from "@/components/seo/metadata"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  Calculator, 
  Users, 
  Mail, 
  Phone, 
  MessageCircle, 
  BookOpen, 
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export const metadata = generateSEOMetadata({
  title: "Help Center | Massachusetts Retirement System Support",
  description:
    "Get help with the Massachusetts Retirement System calculator, find answers to common questions, and access support resources.",
  path: "/help",
  keywords: [
    "Massachusetts retirement help",
    "pension calculator support",
    "retirement planning assistance",
    "MA state employee help",
    "retirement system support",
  ],
})

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions about Massachusetts retirement planning and our calculator tools
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search for help topics..." 
                    className="pl-10"
                  />
                </div>
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Calculator Help</CardTitle>
                <CardDescription>How to use our pension calculator</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/faq#calculator">
                    View Calculator FAQ
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Retirement Groups</CardTitle>
                <CardDescription>Understanding Groups 1-4</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/benefits">
                    Learn About Groups
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Planning Guides</CardTitle>
                <CardDescription>Step-by-step retirement planning</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/guides">
                    View Guides
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Contact Support</CardTitle>
                <CardDescription>Get personalized help</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Common Questions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  How accurate are the calculator results?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our calculator uses official Massachusetts retirement system formulas and provides estimates based on current rules. 
                  However, results are for informational purposes only and should not be considered official benefit estimates.
                </p>
                <Badge variant="outline">Estimation Tool</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-green-600" />
                  Which retirement group am I in?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Most state employees are in Group 1. Group 2 includes probation and court officers. 
                  Group 3 is for State Police. Group 4 includes corrections and public safety personnel.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/benefits">
                    Learn More About Groups
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  What is the difference between retirement options?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Option A provides the highest monthly benefit but no survivor protection. 
                  Options B and C provide survivor benefits but reduce your monthly payment.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/benefits#options">
                    Compare Options
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email Support
                </CardTitle>
                <CardDescription>Get help via email</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Send us your questions and we'll respond within 24 hours during business days.
                </p>
                <Button asChild className="w-full">
                  <Link href="/contact">
                    Send Email
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-green-600" />
                  Official Resources
                </CardTitle>
                <CardDescription>Massachusetts state resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a 
                    href="https://www.mass.gov/service-details/retirement-benefit-estimation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    Official Benefit Estimation
                  </a>
                  <a 
                    href="https://www.mass.gov/service-details/attend-a-seminar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    Retirement Seminars
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status & Updates */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                System Status
              </CardTitle>
              <CardDescription>Current status of our services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Calculator: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Database: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Support: Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Still Need Help */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-purple-100 mb-6">
                Our support team is here to help you with any questions about Massachusetts retirement planning
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Link href="/contact">
                    <Mail className="h-5 w-5 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <Link href="/faq">
                    View All FAQs
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
