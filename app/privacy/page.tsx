import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, UserCheck, FileText, Clock, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | Massachusetts Retirement System",
  description: "Learn how we collect, use, and protect your personal and financial information in our retirement planning application.",
  keywords: "privacy policy, data protection, Massachusetts retirement, personal information, financial data security",
  robots: "index, follow",
  openGraph: {
    title: "Privacy Policy | Massachusetts Retirement System",
    description: "Comprehensive privacy policy for Massachusetts state employee retirement planning application.",
    type: "website",
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy and data security are our top priorities. Learn how we protect your personal and financial information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

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
                <a href="#information-collection" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Information We Collect
                </a>
                <a href="#data-usage" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → How We Use Your Data
                </a>
                <a href="#data-protection" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Data Protection Measures
                </a>
                <a href="#data-sharing" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Information Sharing
                </a>
              </div>
              <div className="space-y-2">
                <a href="#user-rights" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Your Rights & Choices
                </a>
                <a href="#cookies" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Cookies & Tracking
                </a>
                <a href="#data-retention" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Data Retention
                </a>
                <a href="#contact" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  → Contact Information
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Collection */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="information-collection">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Account Information:</strong> Name, email address, and authentication credentials through Google OAuth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Employment Data:</strong> Date of birth, membership date, retirement group, current salary, years of service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Retirement Planning:</strong> Planned retirement date, benefit options, Social Security estimates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Calculation History:</strong> Saved retirement calculations, scenarios, and planning preferences</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Device Information:</strong> Browser type, operating system, screen resolution, and device identifiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Performance Data:</strong> Error logs, performance metrics, and system diagnostics</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="data-usage">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              How We Use Your Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Uses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide retirement benefit calculations and estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Save and manage your retirement planning scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Personalize your experience and recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Authenticate and secure your account access</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Secondary Uses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Improve application performance and user experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide customer support and technical assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Analyze usage patterns for feature development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Ensure security and prevent unauthorized access</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="data-protection">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Data Protection Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Encryption:</strong> All data transmitted using TLS 1.3 encryption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Authentication:</strong> Secure OAuth 2.0 with Google authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Database Security:</strong> Encrypted storage with access controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Monitoring:</strong> Continuous security monitoring and threat detection</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Administrative Safeguards</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Access Control:</strong> Role-based access with principle of least privilege</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Staff Training:</strong> Regular security awareness and privacy training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Incident Response:</strong> Established procedures for security incidents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Regular Audits:</strong> Periodic security assessments and compliance reviews</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="data-sharing">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">We Do NOT Sell Your Data</h3>
                <p className="text-green-700">
                  We never sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Limited Sharing Scenarios</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Service Providers:</strong> Trusted vendors who help operate our application (hosting, analytics, support)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Legal Requirements:</strong> When required by law, court order, or government request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Security Protection:</strong> To protect rights, property, or safety of users and the public</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Aggregated Data:</strong> Anonymous, statistical data that cannot identify individuals</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm" id="user-rights">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Your Rights & Choices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Access Rights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>View Your Data:</strong> Access all personal information we have about you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Update Information:</strong> Correct or update your personal details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Download Data:</strong> Export your data in a portable format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Delete Account:</strong> Request complete removal of your data</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Controls</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Cookie Preferences:</strong> Control tracking and analytics cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Email Communications:</strong> Opt out of non-essential emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Processing:</strong> Object to certain uses of your information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Account Settings:</strong> Manage privacy preferences in your profile</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Data Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm" id="cookies">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-yellow-600" />
                Cookies & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                  <p className="text-sm text-gray-700">Required for authentication, security, and basic functionality.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-gray-700">Help us understand usage patterns and improve the application.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Preference Cookies</h4>
                  <p className="text-sm text-gray-700">Remember your settings and personalization choices.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    You can manage cookie preferences in your browser settings or through our cookie consent banner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm" id="data-retention">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Active Accounts</h4>
                  <p className="text-sm text-gray-700">Data retained while your account is active and for legitimate business purposes.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Inactive Accounts</h4>
                  <p className="text-sm text-gray-700">Data deleted after 3 years of inactivity, with 90-day notice.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p className="text-sm text-gray-700">Some data may be retained longer to comply with legal obligations.</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    You can request immediate deletion of your account and data at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact and Footer */}
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
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Officer</h4>
                  <p className="text-gray-700">
                    Email: <a href="mailto:privacy@retirementplanner.app" className="text-blue-600 hover:text-blue-800">privacy@retirementplanner.app</a><br />
                    Response Time: 5 business days<br />
                    Available: Monday-Friday, 8:00 AM - 5:00 PM EST
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
                  <p className="text-gray-700">
                    Email: <a href="mailto:support@retirementplanner.app" className="text-blue-600 hover:text-blue-800">support@retirementplanner.app</a><br />
                    Response Time: 1-2 business days<br />
                    Support Hours: Monday-Friday, 8:00 AM - 5:00 PM EST
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
              href="/terms" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Terms of Service
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
