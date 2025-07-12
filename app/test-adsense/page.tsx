"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { AutoAds, AutoAdsPlaceholder, SmartAds } from "@/components/ads/auto-ads"

export default function TestAdSensePage() {
  const { data: session } = useSession()
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Collect debug information
    const info = {
      nodeEnv: process.env.NODE_ENV,
      publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
      responsiveSlot: process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT,
      isLoggedIn: !!session?.user,
      userEmail: session?.user?.email,
      isPremium,
      subscriptionStatus,
      adsbygoogleExists: typeof window !== 'undefined' ? !!window.adsbygoogle : false,
      adSenseScriptLoaded: typeof window !== 'undefined' ? !!document.querySelector('script[src*="adsbygoogle.js"]') : false,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
    console.log('AdSense Debug Info:', info)
  }, [session, isPremium, subscriptionStatus])

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AdSense Integration Test</h1>
      
      {/* Debug Information */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* User Status */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">User Status</h2>
        <div className="space-y-2">
          <p><strong>Logged In:</strong> {session?.user ? 'Yes' : 'No'}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'Not logged in'}</p>
          <p><strong>Premium Status:</strong> {isPremium ? 'Premium' : 'Free'}</p>
          <p><strong>Subscription Status:</strong> {subscriptionStatus}</p>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="space-y-2">
          <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Publisher ID:</strong> {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'Not set'}</p>
          <p><strong>Responsive Slot:</strong> {process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT || 'Using fallback'}</p>
        </div>
      </div>

      {/* AdSense Script Status */}
      <div className="bg-yellow-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">AdSense Script Status</h2>
        <div className="space-y-2">
          <p><strong>Script Loaded:</strong> {debugInfo.adSenseScriptLoaded ? 'Yes' : 'No'}</p>
          <p><strong>adsbygoogle Array:</strong> {debugInfo.adsbygoogleExists ? 'Exists' : 'Not found'}</p>
          <p><strong>Should Show Ads:</strong> {!isPremium && process.env.NODE_ENV === 'production' ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Auto Ads Test */}
      <div className="bg-white border-2 border-dashed border-blue-300 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">🚀 Auto Ads Test (NEW)</h2>
        <p className="mb-4">Auto Ads should appear automatically anywhere on this page:</p>

        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-sm text-blue-800">
            <strong>Auto Ads Benefits:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
            <li>No ad unit IDs required</li>
            <li>Automatic optimal placement</li>
            <li>Works immediately if account approved</li>
            <li>Higher revenue potential</li>
          </ul>
        </div>

        <AutoAdsPlaceholder className="border border-blue-300 rounded" />
        <AutoAds />

        <p className="mt-4 text-sm text-blue-600">
          Auto Ads are enabled and should appear automatically if your AdSense account is approved.
        </p>
      </div>

      {/* Manual Ad Test */}
      <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Manual Ad Test (Legacy)</h2>
        <p className="mb-4">This is where the ResponsiveAd component should render:</p>

        <div className="border border-red-300 p-4 rounded">
          <ResponsiveAd className="min-h-[250px] bg-gray-50" />
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Manual ads require real ad unit IDs. Currently using placeholder: {process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT || "4567890123"}
        </p>
      </div>

      {/* Smart Ads Test */}
      <div className="bg-white border-2 border-dashed border-green-300 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">🧠 Smart Ads Test</h2>
        <p className="mb-4">Combines Auto Ads with manual fallback:</p>

        <SmartAds className="border border-green-300 rounded p-4" />

        <p className="mt-4 text-sm text-green-600">
          Smart Ads try Auto Ads first, then fall back to manual ads if needed.
        </p>
      </div>

      {/* Premium Alternative Test */}
      <div className="bg-purple-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Premium Alternative Test</h2>
        <p className="mb-4">This shows what premium users see instead of ads:</p>
        <PremiumAlternative />
      </div>

      {/* Manual Ad Test */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Manual Ad Test</h2>
        <p className="mb-4">Manual ad slot for testing:</p>
        <div id="manual-ad-test" className="border border-green-300 p-4 rounded min-h-[250px] bg-white">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-8456317857596950"
            data-ad-slot="4567890123"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
        <button
          onClick={() => {
            try {
              if (typeof window !== 'undefined') {
                window.adsbygoogle = window.adsbygoogle || []
                window.adsbygoogle.push({})
                console.log('Manual ad push executed, array length:', window.adsbygoogle.length)
              }
            } catch (error) {
              console.error('Manual ad push error:', error)
            }
          }}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Manually Initialize Ad
        </button>
      </div>

      {/* Manual Script Check */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Manual Script Check</h2>
        <button
          onClick={() => {
            const scripts = document.querySelectorAll('script[src*="adsbygoogle"]')
            console.log('AdSense scripts found:', scripts.length)
            scripts.forEach((script, index) => {
              const scriptElement = script as HTMLScriptElement
              console.log(`Script ${index + 1}:`, scriptElement.src)
            })

            if (typeof window !== 'undefined' && window.adsbygoogle) {
              console.log('adsbygoogle array length:', window.adsbygoogle.length)
            } else {
              console.log('adsbygoogle not found on window')
            }

            // Check for ad elements
            const adElements = document.querySelectorAll('.adsbygoogle')
            console.log('Ad elements found:', adElements.length)
            adElements.forEach((el, index) => {
              console.log(`Ad element ${index + 1}:`, el)
            })
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Check Scripts in Console
        </button>
      </div>

      {/* AdSense Manager Debug */}
      <div className="bg-white border-2 border-dashed border-purple-300 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">🔧 AdSense Manager Debug</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => {
              console.log('=== AdSense Manager Debug Info ===')
              try {
                const { getAdSenseManager } = require('@/lib/adsense-manager')
                const manager = getAdSenseManager()
                const debugInfo = manager.getDebugInfo()
                console.log('Manager Debug Info:', debugInfo)
                console.log('Script exists:', !!document.querySelector('script[src*="adsbygoogle.js"]'))
                console.log('adsbygoogle array:', window.adsbygoogle)
                console.log('All ins elements:', document.querySelectorAll('ins.adsbygoogle'))
                console.log('===================================')
              } catch (error) {
                console.error('Debug error:', error)
              }
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Debug Manager Status
          </button>

          <button
            onClick={() => {
              console.log('=== Checking for Duplicate Auto Ads ===')
              if (window.adsbygoogle) {
                const autoAdsItems = window.adsbygoogle.filter(item =>
                  item && typeof item === 'object' && item.enable_page_level_ads
                )
                console.log('Auto Ads attempts found:', autoAdsItems.length)
                console.log('Auto Ads items:', autoAdsItems)
                if (autoAdsItems.length > 1) {
                  console.error('🚨 DUPLICATE AUTO ADS DETECTED! This causes the "Only one enable_page_level_ads allowed" error')
                }
              }
              console.log('=====================================')
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Check Duplicate Auto Ads
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Manager Benefits:</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>✅ Prevents duplicate Auto Ads initialization</li>
            <li>✅ Manages ad element lifecycle properly</li>
            <li>✅ Handles "already have ads" errors</li>
            <li>✅ Provides fallback for unfilled ads</li>
            <li>✅ Centralized error handling and logging</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
