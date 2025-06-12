/**
 * Keyboard navigation utilities for enhanced accessibility
 * Provides comprehensive keyboard interaction support
 */

/**
 * Enhanced keyboard event handler for form navigation
 * @param event - Keyboard event
 * @param options - Navigation options
 */
export function handleFormKeyNavigation(
  event: KeyboardEvent,
  options: {
    onEnter?: () => void
    onEscape?: () => void
    onTab?: (direction: 'forward' | 'backward') => void
    allowEnterSubmit?: boolean
  } = {}
): void {
  const { onEnter, onEscape, onTab, allowEnterSubmit = true } = options

  switch (event.key) {
    case 'Enter':
      if (allowEnterSubmit && onEnter) {
        event.preventDefault()
        onEnter()
      }
      break
    
    case 'Escape':
      if (onEscape) {
        event.preventDefault()
        onEscape()
      }
      break
    
    case 'Tab':
      if (onTab) {
        onTab(event.shiftKey ? 'backward' : 'forward')
      }
      break
  }
}

/**
 * Enhanced arrow key navigation for form fields and lists
 * @param event - Keyboard event
 * @param items - Array of focusable elements
 * @param currentIndex - Current focused item index
 * @param options - Navigation options
 */
export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    wrap?: boolean
    onSelectionChange?: (index: number) => void
  } = {}
): number {
  const { orientation = 'vertical', wrap = true, onSelectionChange } = options
  let newIndex = currentIndex

  switch (event.key) {
    case 'ArrowUp':
      if (orientation === 'vertical' || orientation === 'both') {
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0)
      }
      break
    
    case 'ArrowDown':
      if (orientation === 'vertical' || orientation === 'both') {
        event.preventDefault()
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1)
      }
      break
    
    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'both') {
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0)
      }
      break
    
    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'both') {
        event.preventDefault()
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1)
      }
      break
    
    case 'Home':
      event.preventDefault()
      newIndex = 0
      break
    
    case 'End':
      event.preventDefault()
      newIndex = items.length - 1
      break
  }

  if (newIndex !== currentIndex) {
    items[newIndex]?.focus()
    onSelectionChange?.(newIndex)
  }

  return newIndex
}

/**
 * Skip link functionality for keyboard users
 * @param targetId - ID of the element to skip to
 * @param announcement - Optional announcement for screen readers
 */
export function skipToContent(targetId: string, announcement?: string): void {
  const target = document.getElementById(targetId)
  if (target) {
    target.focus()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    
    if (announcement) {
      // Use our ARIA live region utility
      import('./aria-live').then(({ announceToScreenReader }) => {
        announceToScreenReader(announcement, 'polite')
      })
    }
  }
}

/**
 * Enhanced tab navigation with custom logic
 * @param container - Container element
 * @param direction - Tab direction
 * @param options - Navigation options
 */
export function handleCustomTabNavigation(
  container: HTMLElement,
  direction: 'forward' | 'backward',
  options: {
    skipElements?: string[]
    customOrder?: string[]
    onTabOut?: (direction: 'forward' | 'backward') => void
  } = {}
): boolean {
  const { skipElements = [], customOrder = [], onTabOut } = options
  
  // Get all focusable elements
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  let focusableElements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  
  // Filter out skip elements
  if (skipElements.length > 0) {
    focusableElements = focusableElements.filter(el => 
      !skipElements.some(selector => el.matches(selector))
    )
  }

  // Apply custom order if specified
  if (customOrder.length > 0) {
    const orderedElements: HTMLElement[] = []
    customOrder.forEach(selector => {
      const elements = focusableElements.filter(el => el.matches(selector))
      orderedElements.push(...elements)
    })
    // Add remaining elements
    const remainingElements = focusableElements.filter(el => 
      !customOrder.some(selector => el.matches(selector))
    )
    focusableElements = [...orderedElements, ...remainingElements]
  }

  const currentElement = document.activeElement as HTMLElement
  const currentIndex = focusableElements.indexOf(currentElement)
  
  let nextIndex: number
  if (direction === 'forward') {
    nextIndex = currentIndex + 1
    if (nextIndex >= focusableElements.length) {
      onTabOut?.('forward')
      return false
    }
  } else {
    nextIndex = currentIndex - 1
    if (nextIndex < 0) {
      onTabOut?.('backward')
      return false
    }
  }

  focusableElements[nextIndex]?.focus()
  return true
}

/**
 * Keyboard shortcut handler
 * @param event - Keyboard event
 * @param shortcuts - Map of key combinations to handlers
 */
export function handleKeyboardShortcuts(
  event: KeyboardEvent,
  shortcuts: Map<string, () => void>
): void {
  const key = event.key.toLowerCase()
  const modifiers = []
  
  if (event.ctrlKey) modifiers.push('ctrl')
  if (event.altKey) modifiers.push('alt')
  if (event.shiftKey) modifiers.push('shift')
  if (event.metaKey) modifiers.push('meta')
  
  const combination = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key
  
  const handler = shortcuts.get(combination)
  if (handler) {
    event.preventDefault()
    handler()
  }
}

/**
 * Focus visible indicator management
 * @param element - Element to manage focus for
 * @param options - Focus options
 */
export function manageFocusVisible(
  element: HTMLElement,
  options: {
    showOnKeyboard?: boolean
    hideOnMouse?: boolean
    customClass?: string
  } = {}
): () => void {
  const { showOnKeyboard = true, hideOnMouse = true, customClass = 'focus-visible' } = options
  
  let isKeyboardUser = false
  
  const handleKeyDown = () => {
    isKeyboardUser = true
  }
  
  const handleMouseDown = () => {
    if (hideOnMouse) {
      isKeyboardUser = false
    }
  }
  
  const handleFocus = () => {
    if (showOnKeyboard && isKeyboardUser) {
      element.classList.add(customClass)
    }
  }
  
  const handleBlur = () => {
    element.classList.remove(customClass)
  }
  
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('mousedown', handleMouseDown)
  element.addEventListener('focus', handleFocus)
  element.addEventListener('blur', handleBlur)
  
  // Cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleMouseDown)
    element.removeEventListener('focus', handleFocus)
    element.removeEventListener('blur', handleBlur)
  }
}
