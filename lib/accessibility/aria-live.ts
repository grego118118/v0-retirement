/**
 * ARIA Live Region Utilities
 * Provides screen reader announcements for dynamic content
 */

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const regionId = priority === 'assertive' ? 'aria-live-region-assertive' : 'aria-live-region'
  const region = document.getElementById(regionId)
  
  if (region) {
    region.textContent = message
    // Clear after announcement
    setTimeout(() => {
      region.textContent = ''
    }, 1000)
  }
}

export function announceFormErrors(errors: string[]) {
  const message = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`
  announceToScreenReader(message, 'assertive')
}

export function announceFormSuccess(message: string = 'Form submitted successfully') {
  announceToScreenReader(message, 'polite')
}
