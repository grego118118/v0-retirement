import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Clock, MapPin, MessageSquare, HelpCircle, AlertCircle, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Support | Massachusetts Retirement System",
  description: "Get help with the Massachusetts retirement planning application. Multiple contact methods with clear response time expectations.",
  keywords: "contact support, help, Massachusetts retirement, customer service, technical support",
  robots: "index, follow",
  openGraph: {
    title: "Contact Support | Massachusetts Retirement System",
    description: "Contact information and support options for Massachusetts retirement planning assistance.",
    type: "website",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-600 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help with your retirement planning questions and technical support needs.
          </p>
        </div>

        {/* Response Time Expectations */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Response Time Expectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-blue-800">Email Support</h3>
                <p className="text-blue-700 text-sm">Response within 1-2 business days</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <HelpCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-blue-800">Online Resources</h3>
                <p className="text-blue-700 text-sm">24/7 access to help documentation</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-blue-800">Complex Issues</h3>
                <p className="text-blue-700 text-sm">Up to 5 business days for resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Technical Support */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <MessageSquare className="h-5 w-5" />
                Technical Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-sm">
                For application issues, login problems, or technical difficulties.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Support</h4>
                    <p className="text-gray-700">
                      <a href="mailto:support@retirementplanner.app" className="text-purple-600 hover:text-purple-800">
                        support@retirementplanner.app
                      </a>
                    </p>
                    <p className="text-gray-600 text-sm">Response: 1-2 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Online Help Center</h4>
                    <p className="text-gray-700">
                      <Link href="/help" className="text-purple-600 hover:text-purple-800">
                        Visit Help Center
                      </Link>
                    </p>
                    <p className="text-gray-600 text-sm">24/7 access to guides and documentation</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-semibold text-purple-800 mb-1">Before Contacting Technical Support</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Try using a different browser</li>
                  <li>• Check your internet connection</li>
                  <li>• Note any error messages you see</li>
                  <li>• Check our FAQ section for common solutions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Retirement Planning Support */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <HelpCircle className="h-5 w-5" />
                Retirement Planning Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-sm">
                For questions about retirement benefits, calculations, or planning guidance.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Planning Inquiries</h4>
                    <p className="text-gray-700">
                      <a href="mailto:planning@retirementplanner.app" className="text-green-600 hover:text-green-800">
                        planning@retirementplanner.app
                      </a>
                    </p>
                    <p className="text-gray-600 text-sm">Response: 3-5 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Planning Resources</h4>
                    <p className="text-gray-700">
                      <Link href="/guides" className="text-green-600 hover:text-green-800">
                        Retirement Planning Guides
                      </Link>
                    </p>
                    <p className="text-gray-600 text-sm">Available 24/7 for self-service support</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-1">What to Include in Your Message</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Your full name and account information</li>
                  <li>• Specific questions about retirement planning</li>
                  <li>• Current employment status and retirement group</li>
                  <li>• Preferred method for response</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Information */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              About This Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Independent Retirement Planning Tool</h3>
                <p className="text-blue-700 text-sm">
                  This application is an independent retirement planning tool designed to help Massachusetts state employees
                  estimate their pension benefits. We are not affiliated with the Massachusetts State Retirement Board or
                  any official state agency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Official Information</h4>
                  <p className="text-gray-700 text-sm">
                    For official retirement benefit estimates and authoritative information, please contact:
                  </p>
                  <ul className="text-gray-700 text-sm mt-2 space-y-1">
                    <li>• Your local retirement board</li>
                    <li>• Massachusetts State Retirement Board</li>
                    <li>• Your HR department</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Application Support</h4>
                  <p className="text-gray-700 text-sm">
                    For questions about using this planning tool:
                  </p>
                  <ul className="text-gray-700 text-sm mt-2 space-y-1">
                    <li>• Use the contact methods above</li>
                    <li>• Check our FAQ section</li>
                    <li>• Review the user guide</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Emergency Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-800">
                For urgent application-related matters that cannot wait for normal business hours:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Critical System Issues</h4>
                  <p className="text-red-700 text-sm">
                    If you're unable to access your account or experiencing technical issues:<br />
                    <strong>Priority Email:</strong> emergency@retirementplanner.app<br />
                    <em>Include "URGENT" in subject line for priority handling</em>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">After-Hours Support</h4>
                  <p className="text-red-700 text-sm">
                    For time-sensitive application issues:<br />
                    <strong>Email:</strong> emergency@retirementplanner.app<br />
                    <em>Response within 24 hours on business days</em>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequently Asked Questions */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600" />
              Before You Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Many common questions can be answered quickly through our self-service resources:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Resources</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>
                      <Link href="/faq" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        → Frequently Asked Questions
                      </Link>
                    </li>
                    <li>
                      <Link href="/calculator" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        → Retirement Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/benefits" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        → Benefits Information
                      </Link>
                    </li>
                    <li>
                      <Link href="/resources" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        → Planning Resources
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Common Issues</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Login problems: Try password reset first</li>
                    <li>• Calculator errors: Check input data accuracy</li>
                    <li>• Missing data: Verify with HR department</li>
                    <li>• Browser issues: Clear cache or try different browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/privacy"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/accessibility"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Accessibility Statement
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
