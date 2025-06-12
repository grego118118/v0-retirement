import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Calculator, BookOpen, Users, Phone, Mail } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Resources | MA Pension Estimator",
  description: "Helpful resources for Massachusetts state employees planning their retirement, including official forms, guides, and contact information.",
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Retirement Planning
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Resources
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Essential resources, forms, and information to help Massachusetts state employees
              plan for a <strong>successful retirement</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

      {/* Official Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Official Massachusetts Resources</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Mass.gov Retirement Board
              </CardTitle>
              <CardDescription>
                Official Massachusetts State Retirement Board website with forms and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.mass.gov/orgs/massachusetts-state-retirement-board" target="_blank" rel="noopener noreferrer">
                  Visit Official Site
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-green-600" />
                PERAC Resources
              </CardTitle>
              <CardDescription>
                Public Employee Retirement Administration Commission forms and guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.mass.gov/orgs/public-employee-retirement-administration-commission" target="_blank" rel="noopener noreferrer">
                  PERAC Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planning Guides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Planning Guides</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Group Classifications
              </CardTitle>
              <CardDescription>
                Understanding Group 1, 2, and 3 classifications and benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• Group 1: General employees (2% multiplier)</li>
                <li>• Group 2: Hazardous duty (2.5% multiplier)</li>
                <li>• Group 3: Public safety (2.5% multiplier)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-600" />
                COLA Information
              </CardTitle>
              <CardDescription>
                Cost of Living Adjustments for Massachusetts retirees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• 3% on first $13,000 annually</li>
                <li>• Maximum $390 per year increase</li>
                <li>• Subject to legislative approval</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Retirement Timeline
              </CardTitle>
              <CardDescription>
                Key milestones and deadlines for retirement planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• 90 days before: Submit application</li>
                <li>• 60 days before: Finalize beneficiaries</li>
                <li>• 30 days before: Complete exit interviews</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Massachusetts State Retirement Board
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Phone:</strong> (617) 367-7770</p>
              <p><strong>Hours:</strong> Monday-Friday, 8:30 AM - 5:00 PM</p>
              <p><strong>Address:</strong> One Ashburton Place, Room 409, Boston, MA 02108</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                PERAC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Phone:</strong> (617) 727-9930</p>
              <p><strong>Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM</p>
              <p><strong>Address:</strong> Five Middlesex Avenue, Suite 304, Somerville, MA 02145</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Important Forms */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Important Forms</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Retirement Application</span>
              </div>
              <p className="text-sm text-muted-foreground">Form to initiate retirement process</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="font-medium">Beneficiary Designation</span>
              </div>
              <p className="text-sm text-muted-foreground">Update your beneficiary information</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Service Purchase</span>
              </div>
              <p className="text-sm text-muted-foreground">Purchase additional service credit</p>
            </CardContent>
          </Card>
        </div>
      </section>
      </div>
    </div>
  )
}
