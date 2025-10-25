/**
 * Production Stub for Wizard V2 Development Component
 * 
 * This file serves as a production-safe stub that prevents build errors
 * when the development component is referenced but should not be included
 * in production builds.
 */

import React from 'react'

interface WizardV2DevProps {
  onClose?: () => void
}

// Production stub - returns null and logs warning if accidentally accessed
export function WizardV2Dev({ onClose }: WizardV2DevProps) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('WizardV2Dev component accessed in production - this should not happen')
    return null
  }
  
  // In development, this should never be reached as the real component should be used
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">
        Development component stub - the real WizardV2Dev component should be loaded in development mode.
      </p>
    </div>
  )
}

export default WizardV2Dev
