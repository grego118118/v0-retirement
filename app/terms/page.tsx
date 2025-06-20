import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, Scale, Shield, Calculator, UserCheck, Clock, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | Massachusetts Retirement System",
  description: "Terms of service for the Massachusetts state employee retirement planning application, including calculator disclaimers and usage guidelines.",
  keywords: "terms of service, retirement calculator, Massachusetts, disclaimers, legal terms, user agreement",
  robots: "index, follow",
  openGraph: {
    title: "Terms of Service | Massachusetts Retirement System",
    description: "Legal terms and conditions for using the Massachusetts retirement planning application.",
    type: "website",
  },
}

export default function TermsOfServicePage() {
  const lastUpdated = "January 15, 2025"
  const effectiveDate = "January 1, 2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Legal terms and conditions governing your use of the Massachusetts Retirement System planning application.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 text-sm text-gray-500">
            <span>Effective Date: {effectiveDate}</span>
            <span className="hidden sm:inline">•</span>
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Important Disclaimer */}
        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-amber-800">
              <p className="font-semibold">
                This application provides estimates for informational purposes only and does not constitute official benefit calculations.
              </p>
              <p>
                For official retirement benefit estimates and authoritative information, contact your local retirement board or visit the official Massachusetts State Retirement Board website for authoritative guidance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <a href="#acceptance" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Acceptance of Terms
                </a>
                <a href="#calculator-disclaimers" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Calculator Disclaimers
                </a>
                <a href="#user-responsibilities" className="block text-green-600 hover:text-green-800 transition-colors">
                  → User Responsibilities
                </a>
                <a href="#accuracy-limitations" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Accuracy Limitations
                </a>
              </div>
              <div className="space-y-2">
                <a href="#prohibited-uses" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Prohibited Uses
                </a>
                <a href="#liability-limitations" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Liability Limitations
                </a>
                <a href="#modifications" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Terms Modifications
                </a>
                <a href="#contact" className="block text-green-600 hover:text-green-800 transition-colors">
                  → Contact Information
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="acceptance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              By accessing and using the Massachusetts Retirement System planning application ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Agreement Scope</h3>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• These terms apply to all users of the application</li>
                <li>• Continued use constitutes acceptance of any updates to these terms</li>
                <li>• If you disagree with any part of these terms, you must discontinue use</li>
                <li>• Additional terms may apply to specific features or services</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Calculator Disclaimers */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="calculator-disclaimers">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              Calculator Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Estimates Only</h3>
              <p className="text-red-700 text-sm">
                All calculations provided are estimates based on current laws, regulations, and the information you provide. 
                Actual benefits may differ due to legislative changes, calculation errors, or incomplete information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pension Calculator Limitations</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Based on current Massachusetts retirement laws (Chapter 32)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Does not account for all possible benefit adjustments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>May not reflect recent legislative changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Assumes continuous employment and salary progression</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Security Limitations</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Based on current Social Security Administration formulas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Subject to Windfall Elimination Provision (WEP) and Government Pension Offset (GPO)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>May not reflect future changes to Social Security laws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Requires accurate earnings history for precision</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="user-responsibilities">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information Accuracy</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide accurate and complete information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Update information when circumstances change</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Verify calculations with official sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Understand limitations of estimates provided</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Security</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Maintain confidentiality of your account credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Report unauthorized access immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Use secure networks when accessing the application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Log out when using shared or public computers</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Limitations */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="accuracy-limitations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Accuracy Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">No Guarantee of Accuracy</h3>
              <p className="text-yellow-700 text-sm">
                While we strive for accuracy, we cannot guarantee that all calculations, information, or data provided through this application are error-free, complete, or current.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Factors Affecting Accuracy</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Changes in federal or state retirement laws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Updates to COLA rates and benefit formulas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Individual employment history variations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Technical errors or system limitations</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Verification Required</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Always verify estimates with official sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Consult with retirement counselors for major decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Review official benefit statements regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Report discrepancies to appropriate authorities</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="prohibited-uses">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                You agree not to use this application for any unlawful purpose or in any way that could damage, disable, or impair the service.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Providing false or misleading information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Attempting to gain unauthorized access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Interfering with application security features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Using automated tools to access the service</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Commercial Restrictions</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>No commercial use without written permission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>No redistribution of calculations or data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>No reverse engineering or copying</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>No creation of derivative works</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liability Limitations and Modifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm" id="liability-limitations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />
                Liability Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Disclaimer of Warranties</h4>
                  <p className="text-purple-700 text-sm">
                    This application is provided "as is" without warranties of any kind, either express or implied.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h4>
                  <p className="text-gray-700 text-sm">
                    We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of this application.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Maximum Liability</h4>
                  <p className="text-gray-700 text-sm">
                    Our total liability shall not exceed the amount you paid for using this service (if any) in the 12 months preceding the claim.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm" id="modifications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Terms Modifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Modify</h4>
                  <p className="text-gray-700 text-sm">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notification of Changes</h4>
                  <p className="text-gray-700 text-sm">
                    Significant changes will be communicated through the application or via email to registered users.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Continued Use</h4>
                  <p className="text-gray-700 text-sm">
                    Your continued use of the application after changes constitutes acceptance of the new terms.
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-indigo-800 text-sm">
                    Review these terms periodically to stay informed of any updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="bg-white/80 backdrop-blur-sm" id="contact">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Questions about these Terms of Service? Contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Department</h4>
                  <p className="text-gray-700 text-sm">
                    Email: <a href="mailto:legal@retirementplanner.app" className="text-blue-600 hover:text-blue-800">legal@retirementplanner.app</a><br />
                    Response Time: 10 business days<br />
                    Available: Monday-Friday, 9:00 AM - 5:00 PM EST
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Official Retirement Information</h4>
                  <p className="text-gray-700 text-sm">
                    For official retirement information, please contact:<br />
                    Your local retirement board<br />
                    Massachusetts State Retirement Board (official)<br />
                    <em>This application is not affiliated with official state agencies</em>
                  </p>
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
              href="/accessibility" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accessibility Statement
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
