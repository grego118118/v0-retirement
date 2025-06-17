/**
 * Focus Management Utilities
 * Handles keyboard navigation and focus for accessibility
 */

export function focusFirstErrorField() {
  const errorField = document.querySelector('[aria-invalid="true"]') as HTMLElement
  if (errorField) {
    errorField.focus()
    return true
  }
  return false
}

export function focusElement(selector: string) {
  const element = document.querySelector(selector) as HTMLElement
  if (element) {
    element.focus()
    return true
  }
  return false
}

export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  })
}
