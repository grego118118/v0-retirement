/**
 * Development Page for Phase 1 Wizard V2 Testing
 *
 * This page is for development and testing only.
 * It allows us to test the new 4-step wizard implementation
 * without affecting the production wizard.
 */

import { Metadata } from "next"
import { WizardV2Dev } from "@/components/wizard/wizard-v2-dev"

export const metadata: Metadata = {
  title: "Wizard V2 Development | Massachusetts Retirement System",
  description: "Development testing for the new 4-step wizard implementation",
  robots: "noindex, nofollow" // Prevent search engine indexing
}

export default function WizardV2DevPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        {/* Development Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Massachusetts Retirement System
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            Phase 1 Wizard Development
          </h2>
          <div className="flex justify-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Development Mode
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              4-Step Wizard
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Phase 1
            </span>
          </div>
        </div>
        
        {/* Development Notice */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  Development Environment
                </h3>
                <p className="text-sm text-yellow-700">
                  This is a development version of the new 4-step wizard. It's designed to test 
                  the consolidated user experience while preserving all calculation accuracy. 
                  This version is not connected to production data or user accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wizard Component */}
        <WizardV2Dev />
        
        {/* Development Footer */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Phase 1 Implementation Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">✅ Completed:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Consolidated Essential Information step</li>
                  <li>• Smart auto-population logic</li>
                  <li>• Real-time calculation preview</li>
                  <li>• 4-step navigation system</li>
                  <li>• Proactive validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">🚧 In Progress:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Benefits & Income step</li>
                  <li>• Goals & Preferences step</li>
                  <li>• Enhanced Results presentation</li>
                  <li>• Integration with existing calculator</li>
                  <li>• Comprehensive testing</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Next Steps:</strong> Complete remaining steps, integrate with existing calculation 
                functions, conduct user testing, and prepare for gradual production rollout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
