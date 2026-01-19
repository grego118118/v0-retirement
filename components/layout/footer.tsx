import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Building, Globe, BookOpen, Zap, FileText, Calendar, Users, Shield } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 mt-16"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content - Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">

          {/* Legal & Compliance Card - Phase 1 */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                Legal & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-gray-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Accessibility Statement
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Help Center
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tools & Calculators Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calculator className="h-5 w-5" />
                Tools & Calculators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/calculator" className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Pension Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/ssfa-auditor" className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    SSFA Back-Pay Auditor
                  </Link>
                </li>

                <li>
                  <Link href="/tax-bomb" className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Tax Bomb Auditor
                  </Link>
                </li>
                <li>
                  <Link href="/social-security" className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Social Security Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/wizard" className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Retirement Planning Wizard
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.aarp.org/work/retirement-planning/retirement_calculator.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    AARP Retirement Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.mass.gov/service-details/retirement-benefit-estimation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Official Benefit Estimation
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Planning Resources Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Building className="h-5 w-5" />
                Planning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/resources" className="text-gray-600 hover:text-green-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Planning Resources
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-600 hover:text-green-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Retirement Guides
                  </Link>
                </li>
                <li>
                  <Link href="/benefits" className="text-gray-600 hover:text-green-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Benefits Information
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="text-gray-600 hover:text-green-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Pension Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-green-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    About This Tool
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Federal Resources Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Globe className="h-5 w-5" />
                Federal Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://www.ssa.gov/benefits/retirement/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    Social Security Administration
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ssa.gov/benefits/retirement/planner/wep.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    Windfall Elimination (WEP)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ssa.gov/benefits/retirement/planner/gpo.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    Government Pension Offset
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.medicare.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    Medicare Information
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.consumerfinance.gov/consumer-tools/retirement/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    CFPB Retirement Tools
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Learning & Support Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <BookOpen className="h-5 w-5" />
                Learning & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/faq" className="text-gray-600 hover:text-orange-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-orange-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                    Retirement Planning Blog
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-gray-600 hover:text-orange-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                    Complete Resources Guide
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.mass.gov/service-details/attend-a-seminar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-orange-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                    Retirement Seminars
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-orange-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                    Contact Support
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Zap className="h-5 w-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    About the System
                  </Link>
                </li>
                <li>
                  <Link href="/ssfa-auditor" className="text-gray-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                    SSFA Auditor
                  </Link>
                </li>
                <li>
                  <Link href="/tax-bomb" className="text-gray-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    Tax Bomb
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    Premium Features
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-gray-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    Search Resources
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    📧 Contact Support
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Popular Articles Section */}
        <div className="border-t border-gray-200 pt-6 pb-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Most Helpful Guides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <Link
              href="/blog/massachusetts-cola-2026-complete-guide"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Massachusetts COLA 2026 Complete Guide"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Massachusetts COLA 2026 Guide
            </Link>
            <Link
              href="/blog/understanding-massachusetts-pension-options"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Understanding Massachusetts Pension Options A, B, C"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Pension Options A, B, C Explained
            </Link>
            <Link
              href="/blog/social-security-fairness-act-what-massachusetts-state-employees-need-to-know"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Social Security Fairness Act Guide"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Social Security Fairness Act
            </Link>
            <Link
              href="/blog/retirement-planning-for-massachusetts-state-employees"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Retirement Planning Timeline"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Retirement Planning Timeline
            </Link>
            <Link
              href="/blog/massachusetts-retirement-groups-1-4-complete-guide"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Massachusetts Retirement Groups 1-4 Guide"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Retirement Groups 1-4 Guide
            </Link>
            <Link
              href="/blog/maximizing-your-state-pension-benefits"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Strategies to Maximize Your Pension Benefits"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Maximize Your Pension Benefits
            </Link>
            <Link
              href="/blog/creditable-service-guide-for-ma-state-employees"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Creditable Service Purchase Guide"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Creditable Service Guide
            </Link>
            <Link
              href="/blog/retirement-healthcare-options-for-state-employees"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              title="Healthcare Options for Retired State Employees"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
              Retiree Healthcare Options
            </Link>
          </div>
        </div>

        {/* Additional Resources Bar */}
        <div className="border-t border-gray-200 pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

            {/* Publications & Forms */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Publications & Forms</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <Link href="/blog" className="hover:text-gray-900 transition-colors" title="Massachusetts Retirement Planning Blog">
                    Retirement Planning Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="hover:text-gray-900 transition-colors" title="Retirement Planning Guides">
                    Planning Guides
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-gray-900 transition-colors" title="Complete Resource Library">
                    Complete Resource Library
                  </Link>
                </li>
              </ul>
            </div>

            {/* Educational Resources */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Educational Resources</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <Link href="/checklist" className="hover:text-gray-900 transition-colors" title="Retirement Planning Checklist">
                    Retirement Planning Checklist
                  </Link>
                </li>
                <li>
                  <Link href="/service-guide" className="hover:text-gray-900 transition-colors" title="Service Credit Guide">
                    Service Credit Guide
                  </Link>
                </li>
                <li>
                  <Link href="/financial-literacy" className="hover:text-gray-900 transition-colors" title="Financial Planning Resources">
                    Financial Planning Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Events & Contact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Events & Contact</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <Link href="/events" className="hover:text-gray-900 transition-colors" title="Planning Workshops">
                    Planning Workshops
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="hover:text-gray-900 transition-colors" title="Educational Webinars">
                    Educational Webinars
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors" title="Contact Support">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <p>
                &copy; {currentYear} Massachusetts Pension Estimator. All rights reserved.
              </p>
              <p className="mt-1">
                This tool is for informational purposes only and does not constitute official benefit estimates.
              </p>
              <p className="mt-1 text-xs">
                For official estimates, contact your local retirement board or the Massachusetts State Retirement Board
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="hover:text-gray-900 transition-colors">
                Accessibility
              </Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">
                Contact Support
              </Link>
              <Link href="/about" className="hover:text-gray-900 transition-colors">
                About This Tool
              </Link>
              <span className="mx-2">•</span>
              <Link href="/methodology" className="hover:text-gray-900 transition-colors">
                Methodology & Formulas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
