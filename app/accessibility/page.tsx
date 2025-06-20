import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Keyboard, Volume2, Monitor, Users, CheckCircle, AlertCircle, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Accessibility Statement | Massachusetts Retirement System",
  description: "Our commitment to digital accessibility and WCAG 2.1 AA compliance for the Massachusetts retirement planning application.",
  keywords: "accessibility, WCAG, Section 508, assistive technology, screen reader, Massachusetts retirement",
  robots: "index, follow",
  openGraph: {
    title: "Accessibility Statement | Massachusetts Retirement System",
    description: "Learn about our accessibility features and commitment to inclusive design.",
    type: "website",
  },
}

export default function AccessibilityPage() {
  const lastUpdated = "January 15, 2025"
  const complianceDate = "January 1, 2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-600 rounded-full">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We are committed to ensuring digital accessibility for all users, including those with disabilities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 text-sm text-gray-500">
            <span>Compliance Date: {complianceDate}</span>
            <span className="hidden sm:inline">•</span>
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Commitment Statement */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-green-800">
              <p className="font-semibold">
                The Massachusetts Retirement System application is designed to be accessible to all users, regardless of ability or technology used.
              </p>
              <p>
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards and Section 508 compliance requirements for government applications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Standards */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Compliance Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Standards We Follow</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Section 508:</strong> Federal accessibility requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>ADA Compliance:</strong> Americans with Disabilities Act</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>ARIA Standards:</strong> Accessible Rich Internet Applications</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Testing Methods</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Automated Testing:</strong> Regular scans with accessibility tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Manual Testing:</strong> Keyboard navigation and screen reader testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>User Testing:</strong> Feedback from users with disabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Expert Review:</strong> Third-party accessibility audits</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Accessibility Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Keyboard Navigation */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Keyboard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Full keyboard accessibility</li>
                  <li>• Logical tab order</li>
                  <li>• Visible focus indicators</li>
                  <li>• Skip navigation links</li>
                </ul>
              </div>

              {/* Screen Reader Support */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Volume2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Support</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• ARIA labels and descriptions</li>
                  <li>• Semantic HTML structure</li>
                  <li>• Alternative text for images</li>
                  <li>• Form field labels</li>
                </ul>
              </div>

              {/* Visual Accessibility */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Visual Accessibility</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• High contrast color schemes</li>
                  <li>• Scalable text (up to 200%)</li>
                  <li>• Color-independent information</li>
                  <li>• Clear visual hierarchy</li>
                </ul>
              </div>

              {/* Device Compatibility */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Monitor className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Device Compatibility</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Responsive design</li>
                  <li>• Touch-friendly interfaces</li>
                  <li>• Mobile accessibility</li>
                  <li>• Cross-browser support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assistive Technology Support */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-indigo-600" />
              Assistive Technology Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-gray-700">
                Our application has been tested and optimized for compatibility with various assistive technologies:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Screen Readers</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>JAWS:</strong> Job Access With Speech (Windows)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>NVDA:</strong> NonVisual Desktop Access (Windows)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>VoiceOver:</strong> Built-in screen reader (macOS/iOS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>TalkBack:</strong> Android accessibility service</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Assistive Tools</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Voice Recognition:</strong> Dragon NaturallySpeaking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Magnification:</strong> ZoomText, built-in browser zoom</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Switch Navigation:</strong> Alternative input devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Eye Tracking:</strong> Gaze-controlled navigation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Known Issues */}
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Known Issues & Ongoing Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-yellow-800">
              <p>
                We continuously work to improve accessibility. Currently identified areas for enhancement include:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Enhanced chart accessibility for complex financial data visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Improved mobile touch target sizing for users with motor impairments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Additional keyboard shortcuts for power users</span>
                </li>
              </ul>
              <p className="text-sm">
                <strong>Target completion:</strong> These improvements are scheduled for implementation by March 2025.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Accessibility Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                If you encounter accessibility barriers or need assistance using this application, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accessibility Coordinator</h4>
                  <p className="text-gray-700 text-sm">
                    Email: <a href="mailto:accessibility@retirementplanner.app" className="text-blue-600 hover:text-blue-800">accessibility@retirementplanner.app</a><br />
                    Response Time: 2 business days<br />
                    Available: Monday-Friday, 8:00 AM - 5:00 PM EST<br />
                    Alternative formats available upon request
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Alternative Formats</h4>
                  <p className="text-gray-700 text-sm">
                    We can provide information in alternative formats:<br />
                    • Large print documents<br />
                    • Audio recordings<br />
                    • Braille materials<br />
                    • Electronic formats (PDF, Word, etc.)
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Feedback Welcome</h4>
                <p className="text-blue-700 text-sm">
                  Your feedback helps us improve accessibility. Please share your experience, report issues, or suggest improvements. 
                  We value input from users with disabilities and their advocates.
                </p>
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
              href="/contact" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Contact Support
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
