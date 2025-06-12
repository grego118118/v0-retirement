import { Metadata } from "next"
import { TaxImplicationsCalculator } from "@/components/tax-implications-calculator"

export const metadata: Metadata = {
  title: "Tax Implications Calculator | Massachusetts Retirement System",
  description: "Calculate federal and Massachusetts state tax implications on your retirement income including pension and Social Security benefits.",
  keywords: "tax calculator, retirement taxes, Massachusetts taxes, federal taxes, pension taxation, Social Security taxes",
}

export default function TaxCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white py-16 px-8 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Tax Implications
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Calculator
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
                Understand the federal and Massachusetts state tax impact on your retirement income
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-blue-200">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">2024 Tax Brackets</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Social Security Taxation</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Massachusetts Benefits</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Calculator */}
        <TaxImplicationsCalculator />

        {/* Educational Content */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
              Federal Tax Considerations
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• Progressive tax brackets (10% to 37%)</li>
              <li>• Standard deductions reduce taxable income</li>
              <li>• Social Security may be partially taxable</li>
              <li>• Pension income is generally taxable</li>
              <li>• Additional exemptions for age 65+</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
              Massachusetts Tax Benefits
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• Flat 5.0% income tax rate</li>
              <li>• Social Security benefits not taxed</li>
              <li>• Government pensions may be exempt</li>
              <li>• Senior Circuit Breaker credit</li>
              <li>• Age 65+ additional exemption ($700)</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
              Planning Strategies
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• Consider Roth IRA conversions</li>
              <li>• Plan withdrawal timing</li>
              <li>• Maximize deductions and exemptions</li>
              <li>• Understand Social Security taxation</li>
              <li>• Consult with tax professionals</li>
            </ul>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mt-12 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important Disclaimer</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This calculator provides estimates based on current tax laws and should not be considered as professional tax advice. 
                Tax laws are complex and subject to change. Individual circumstances may affect your actual tax liability. 
                Please consult with a qualified tax professional for personalized advice regarding your specific situation.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
