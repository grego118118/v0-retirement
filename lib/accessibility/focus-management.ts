/**
 * Focus management utilities for accessibility
 * Provides functions for managing focus in complex UI interactions
 */

/**
 * Focus the first focusable element within a container
 * @param container - The container element to search within
 * @returns Whether focus was successfully set
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const focusableElement = getFocusableElements(container)[0]
  if (focusableElement) {
    focusableElement.focus()
    return true
  }
  return false
}

/**
 * Focus the last focusable element within a container
 * @param container - The container element to search within
 * @returns Whether focus was successfully set
 */
export function focusLastElement(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container)
  const lastElement = focusableElements[focusableElements.length - 1]
  if (lastElement) {
    lastElement.focus()
    return true
  }
  return false
}

/**
 * Get all focusable elements within a container
 * @param container - The container to search within
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  
  return elements.filter(element => {
    return element.offsetWidth > 0 && 
           element.offsetHeight > 0 && 
           !element.hasAttribute('hidden') &&
           window.getComputedStyle(element).visibility !== 'hidden'
  })
}

/**
 * Trap focus within a container (useful for modals, dialogs)
 * @param container - The container to trap focus within
 * @returns Function to remove the focus trap
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  
  // Focus the first element initially
  firstElement?.focus()

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Save current focus and return a function to restore it
 * @returns Function to restore focus to the previously focused element
 */
export function saveFocus(): () => void {
  const activeElement = document.activeElement as HTMLElement
  
  return () => {
    if (activeElement && typeof activeElement.focus === 'function') {
      activeElement.focus()
    }
  }
}

/**
 * Focus an element by ID with error handling
 * @param elementId - ID of the element to focus
 * @returns Whether focus was successful
 */
export function focusElementById(elementId: string): boolean {
  const element = document.getElementById(elementId) as HTMLElement
  if (element && typeof element.focus === 'function') {
    element.focus()
    return true
  }
  return false
}

/**
 * Focus the first error field in a form
 * @param formElement - The form element to search within
 * @returns Whether an error field was found and focused
 */
export function focusFirstErrorField(formElement: HTMLElement): boolean {
  // Look for elements with aria-invalid="true" or error classes
  const errorSelectors = [
    '[aria-invalid="true"]',
    '.error input',
    '.error select',
    '.error textarea',
    'input[aria-describedby*="error"]',
    'select[aria-describedby*="error"]',
    'textarea[aria-describedby*="error"]'
  ].join(', ')

  const errorElement = formElement.querySelector(errorSelectors) as HTMLElement
  if (errorElement && typeof errorElement.focus === 'function') {
    errorElement.focus()
    return true
  }
  
  return false
}

/**
 * Manage focus for step-by-step forms/wizards
 * @param currentStep - Current step number
 * @param totalSteps - Total number of steps
 * @param stepContainer - Container for the current step
 */
export function manageFocusForStep(
  currentStep: number, 
  totalSteps: number, 
  stepContainer: HTMLElement
): void {
  // Focus the first focusable element in the new step
  setTimeout(() => {
    focusFirstElement(stepContainer)
  }, 100) // Small delay to ensure DOM is updated
}
