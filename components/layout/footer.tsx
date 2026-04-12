import Link from "next/link"
import { Calculator, Shield, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="bg-mrs-navy-900 border-t-4 border-mrs-gold-600"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 max-w-7xl py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Tools */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-400" />
              Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/calculator" className="text-slate-400 hover:text-white transition-colors">Pension Calculator</Link></li>
              <li><Link href="/ssfa-auditor" className="text-slate-400 hover:text-white transition-colors">SSFA Back-Pay Auditor</Link></li>
              <li><Link href="/tax-bomb" className="text-slate-400 hover:text-white transition-colors">Tax Bomb Defuser</Link></li>
              <li><Link href="/social-security" className="text-slate-400 hover:text-white transition-colors">Social Security Calculator</Link></li>
              <li><Link href="/wizard" className="text-slate-400 hover:text-white transition-colors">Retirement Wizard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/guides" className="text-slate-400 hover:text-white transition-colors">Retirement Guides</Link></li>
              <li><Link href="/resources" className="text-slate-400 hover:text-white transition-colors">Resource Library</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/checklist" className="text-slate-400 hover:text-white transition-colors">Retirement Checklist</Link></li>
              <li><Link href="/financial-literacy" className="text-slate-400 hover:text-white transition-colors">Financial Literacy</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/methodology" className="text-slate-400 hover:text-white transition-colors">Methodology</Link></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/editorial-policy" className="text-slate-400 hover:text-white transition-colors">Editorial Policy</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/accessibility" className="text-slate-400 hover:text-white transition-colors">Accessibility</Link></li>
              <li><Link href="/help" className="text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>

        {/* Popular Guides */}
        <div className="border-t border-mrs-navy-700 pt-6 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Popular Guides</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/blog/massachusetts-cola-2026-complete-guide" className="text-slate-400 hover:text-white transition-colors">COLA 2026 Guide</Link>
            <Link href="/blog/understanding-massachusetts-pension-options" className="text-slate-400 hover:text-white transition-colors">Options A, B, C</Link>
            <Link href="/blog/social-security-fairness-act-what-massachusetts-state-employees-need-to-know" className="text-slate-400 hover:text-white transition-colors">Social Security Fairness Act</Link>
            <Link href="/blog/retirement-planning-for-massachusetts-state-employees" className="text-slate-400 hover:text-white transition-colors">Retirement Planning Timeline</Link>
            <Link href="/blog/massachusetts-retirement-groups-1-4-complete-guide" className="text-slate-400 hover:text-white transition-colors">Groups 1-4 Guide</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-mrs-navy-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-sm text-slate-500">
              <p>&copy; {currentYear} Massachusetts Pension Estimator. All rights reserved.</p>
              <p className="mt-1 text-xs">
                For informational purposes only. Contact your local retirement board for official estimates.
              </p>
              <div className="flex items-center gap-1 text-xs mt-1">
                <span>Website by</span>
                <a
                  href="https://gowebautomations.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Go Web Automations
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              <a href="mailto:hello@masspension.com" className="hover:text-white transition-colors flex items-center gap-1">
                <Mail className="h-3 w-3" />
                hello@masspension.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
