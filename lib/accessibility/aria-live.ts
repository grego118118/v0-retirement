/**
 * Utility functions for managing ARIA live regions for screen reader announcements
 * Provides accessible feedback for dynamic content changes
 */

export type AriaLiveLevel = 'polite' | 'assertive'

/**
 * Announce a message to screen readers using ARIA live regions
 * @param message - The message to announce
 * @param level - The urgency level ('polite' for non-urgent, 'assertive' for urgent)
 * @param delay - Optional delay before announcement (useful for avoiding conflicts)
 */
export function announceToScreenReader(
  message: string, 
  level: AriaLiveLevel = 'polite',
  delay: number = 0
): void {
  if (typeof window === 'undefined') return

  const announce = () => {
    const regionId = level === 'assertive' ? 'aria-live-region-assertive' : 'aria-live-region'
    const liveRegion = document.getElementById(regionId)
    
    if (liveRegion) {
      // Clear the region first to ensure the message is announced
      liveRegion.textContent = ''
      
      // Use a small timeout to ensure the clearing is processed
      setTimeout(() => {
        liveRegion.textContent = message
      }, 10)
    }
  }

  if (delay > 0) {
    setTimeout(announce, delay)
  } else {
    announce()
  }
}

/**
 * Announce form validation errors
 * @param errors - Array of error messages
 */
export function announceFormErrors(errors: string[]): void {
  if (errors.length === 0) return
  
  const message = errors.length === 1 
    ? `Form error: ${errors[0]}` 
    : `Form has ${errors.length} errors: ${errors.join(', ')}`
  
  announceToScreenReader(message, 'assertive')
}

/**
 * Announce successful form submission
 * @param message - Success message
 */
export function announceFormSuccess(message: string): void {
  announceToScreenReader(`Success: ${message}`, 'polite')
}

/**
 * Announce page navigation
 * @param pageName - Name of the new page
 */
export function announcePageNavigation(pageName: string): void {
  announceToScreenReader(`Navigated to ${pageName}`, 'polite', 500)
}

/**
 * Announce calculation results
 * @param resultType - Type of calculation (e.g., 'pension', 'tax')
 * @param summary - Brief summary of results
 */
export function announceCalculationResults(resultType: string, summary: string): void {
  announceToScreenReader(`${resultType} calculation complete: ${summary}`, 'polite')
}

/**
 * Announce loading states
 * @param isLoading - Whether content is loading
 * @param contentType - Type of content being loaded
 */
export function announceLoadingState(isLoading: boolean, contentType: string = 'content'): void {
  const message = isLoading 
    ? `Loading ${contentType}...` 
    : `${contentType} loaded`
  
  announceToScreenReader(message, 'polite')
}

/**
 * Announce data updates (for dashboard cards, etc.)
 * @param updateType - Type of update
 * @param details - Details about the update
 */
export function announceDataUpdate(updateType: string, details?: string): void {
  const message = details 
    ? `${updateType} updated: ${details}` 
    : `${updateType} updated`
  
  announceToScreenReader(message, 'polite')
}

/**
 * Clear all live regions
 */
export function clearLiveRegions(): void {
  if (typeof window === 'undefined') return
  
  const politeRegion = document.getElementById('aria-live-region')
  const assertiveRegion = document.getElementById('aria-live-region-assertive')
  
  if (politeRegion) politeRegion.textContent = ''
  if (assertiveRegion) assertiveRegion.textContent = ''
}
