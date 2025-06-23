/**
 * AdSense Test Page
 * 
 * This page is for testing AdSense integration in development.
 * It shows how ads will appear for different user states.
 */

import { BannerAd, ResponsiveAd, SquareAd, SidebarAd, PremiumAlternative } from "@/components/ads/adsense"

export default function TestAdsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AdSense Integration Test
          </h1>
          <p className="text-gray-600">
            Testing ad placement and behavior in development mode
          </p>
        </div>

        {/* Environment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Environment Information</h2>
          <div className="text-sm text-blue-800">
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</p>
            <p><strong>Publisher ID:</strong> {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-8456317857596950 (fallback)'}</p>
            <p><strong>Expected Behavior:</strong> {process.env.NODE_ENV === 'development' ? 'Ad placeholders should show' : 'Real ads should show'}</p>
          </div>
        </div>

        {/* Test Different Ad Types */}
        <div className="space-y-8">
          
          {/* Banner Ad Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Banner Ad Test</h3>
            <p className="text-gray-600 mb-4">This should show a banner ad placeholder in development:</p>
            <BannerAd />
          </div>

          {/* Responsive Ad Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Responsive Ad Test</h3>
            <p className="text-gray-600 mb-4">This should show a responsive ad placeholder in development:</p>
            <ResponsiveAd />
          </div>

          {/* Square Ad Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Square Ad Test</h3>
            <p className="text-gray-600 mb-4">This should show a square ad placeholder in development:</p>
            <SquareAd />
          </div>

          {/* Sidebar Ad Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sidebar Ad Test</h3>
            <p className="text-gray-600 mb-4">This should show a sidebar ad placeholder in development:</p>
            <SidebarAd />
          </div>

          {/* Premium Alternative Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Premium Alternative Test</h3>
            <p className="text-gray-600 mb-4">This shows what premium users see instead of ads:</p>
            <PremiumAlternative />
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">What You Should See</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p><strong>In Development:</strong> Gray dashed boxes with "AdSense Ad Placeholder" text and slot IDs</p>
            <p><strong>In Production:</strong> Real Google AdSense ads (only for non-premium users)</p>
            <p><strong>When Signed In as Premium:</strong> Blue gradient boxes with "Thank you for being Premium" message</p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Troubleshooting</h3>
          <div className="text-sm text-red-800 space-y-2">
            <p><strong>If you see nothing:</strong> Check browser console for errors</p>
            <p><strong>If ads don't load in production:</strong> Verify environment variables are set</p>
            <p><strong>If premium users see ads:</strong> Check subscription status hook</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
