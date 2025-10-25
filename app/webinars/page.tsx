import { generateSEOMetadata } from "@/components/seo/metadata"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Play,
  Download,
  BookOpen,
  Calculator,
  Monitor,
  Headphones
} from "lucide-react"
import Link from "next/link"

export const metadata = generateSEOMetadata({
  title: "Educational Webinars | Massachusetts Retirement Planning",
  description:
    "Access educational webinars about Massachusetts state employee retirement planning, pension benefits, and financial preparation for retirement.",
  path: "/webinars",
  keywords: [
    "Massachusetts retirement webinars",
    "pension education videos",
    "retirement planning seminars",
    "state employee training",
    "online retirement education",
  ],
})

export default function WebinarsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Educational Webinars
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about Massachusetts retirement planning through our educational webinar series
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Webinar Series Coming Soon</h2>
              <p className="text-blue-100 mb-6">
                We're developing a comprehensive series of educational webinars to help Massachusetts state employees 
                plan for retirement. Stay tuned for announcements!
              </p>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/contact">
                  Get Notified
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Planned Webinar Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Planned Webinar Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Retirement Basics
                </CardTitle>
                <CardDescription>Foundation knowledge for all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Understanding retirement groups</li>
                  <li>• Benefit calculation methods</li>
                  <li>• Minimum retirement ages</li>
                  <li>• Service credit requirements</li>
                </ul>
                <Badge variant="outline">Beginner Level</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Calculator Mastery
                </CardTitle>
                <CardDescription>Advanced tool usage and optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Using the pension calculator</li>
                  <li>• Scenario planning techniques</li>
                  <li>• Combined planning wizard</li>
                  <li>• Optimization strategies</li>
                </ul>
                <Badge variant="outline">Intermediate Level</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Social Security Integration
                </CardTitle>
                <CardDescription>Coordinating pension and Social Security</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• WEP and GPO provisions</li>
                  <li>• Claiming strategies</li>
                  <li>• Spousal benefits</li>
                  <li>• Total income optimization</li>
                </ul>
                <Badge variant="outline">Advanced Level</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-orange-600" />
                  Healthcare in Retirement
                </CardTitle>
                <CardDescription>Medicare and supplemental coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Medicare enrollment process</li>
                  <li>• Supplemental insurance options</li>
                  <li>• Healthcare cost planning</li>
                  <li>• State retiree benefits</li>
                </ul>
                <Badge variant="outline">All Levels</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-red-600" />
                  Financial Planning
                </CardTitle>
                <CardDescription>Comprehensive retirement financial planning</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Retirement budgeting</li>
                  <li>• Investment strategies</li>
                  <li>• Tax planning in retirement</li>
                  <li>• Estate planning basics</li>
                </ul>
                <Badge variant="outline">Intermediate Level</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Timing Your Retirement
                </CardTitle>
                <CardDescription>When and how to retire optimally</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Optimal retirement timing</li>
                  <li>• Early vs. normal retirement</li>
                  <li>• Working after retirement</li>
                  <li>• Application process timeline</li>
                </ul>
                <Badge variant="outline">Advanced Level</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Webinar Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Webinar Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" />
                  Live & Interactive
                </CardTitle>
                <CardDescription>Real-time learning experience</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Live Q&A sessions with experts</li>
                  <li>• Interactive polls and quizzes</li>
                  <li>• Real-time chat support</li>
                  <li>• Screen sharing for demonstrations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Resources & Materials
                </CardTitle>
                <CardDescription>Take-home learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Downloadable presentation slides</li>
                  <li>• Planning worksheets and checklists</li>
                  <li>• Resource links and references</li>
                  <li>• Follow-up email summaries</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Requirements */}
        <div className="mb-12">
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-gray-600" />
                Technical Requirements
              </CardTitle>
              <CardDescription>What you'll need to participate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Minimum Requirements</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Computer, tablet, or smartphone</li>
                    <li>• Stable internet connection</li>
                    <li>• Web browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>• Audio capability (speakers or headphones)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommended</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Microphone for Q&A participation</li>
                    <li>• Larger screen for better visibility</li>
                    <li>• Note-taking materials</li>
                    <li>• Calculator access for exercises</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Learning Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Interactive Calculator</CardTitle>
                <CardDescription>Hands-on pension planning tool</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Start learning with our comprehensive pension calculator. 
                  Get immediate feedback and explore different retirement scenarios.
                </p>
                <Button asChild className="w-full">
                  <Link href="/calculator">
                    <Calculator className="h-4 w-4 mr-2" />
                    Try Calculator
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Planning Guides</CardTitle>
                <CardDescription>Comprehensive written resources</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Access detailed guides covering all aspects of Massachusetts retirement planning 
                  at your own pace.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/guides">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Guides
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Planning Checklist</CardTitle>
                <CardDescription>Step-by-step retirement preparation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Follow our comprehensive checklist to ensure you don't miss any important 
                  retirement planning steps.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/checklist">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Checklist
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Stay Updated on Webinars</h2>
              <p className="text-purple-100 mb-6">
                Be the first to know when our educational webinar series launches
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Link href="/contact">
                    <Video className="h-5 w-5 mr-2" />
                    Get Notified
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <Link href="/calculator">
                    Start Planning Now
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
