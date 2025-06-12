import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { validateColorAccessibility, accessibleColors, meetsContrastRequirement } from '@/lib/accessibility/color-contrast'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { ProfileProvider } from '@/contexts/profile-context'
import PensionCalculator from '@/components/pension-calculator'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/calculator',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={null}>
    <ProfileProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ProfileProvider>
  </SessionProvider>
)

describe('Accessibility Tests', () => {
  it('Header component should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Footer component should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Pension Calculator should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <PensionCalculator />
      </TestWrapper>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper semantic structure', async () => {
    const { container } = render(
      <TestWrapper>
        <div>
          <Header />
          <main id="main-content" role="main" aria-label="Main content">
            <PensionCalculator />
          </main>
          <Footer />
        </div>
      </TestWrapper>
    )

    // Check for semantic landmarks
    expect(container.querySelector('header[role="banner"]')).toBeInTheDocument()
    expect(container.querySelector('main[role="main"]')).toBeInTheDocument()
    expect(container.querySelector('footer[role="contentinfo"]')).toBeInTheDocument()
    expect(container.querySelector('nav[role="navigation"]')).toBeInTheDocument()

    // Run axe accessibility tests
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper form accessibility', async () => {
    const { container } = render(
      <TestWrapper>
        <PensionCalculator />
      </TestWrapper>
    )

    // Check for fieldsets and legends
    const fieldsets = container.querySelectorAll('fieldset')
    expect(fieldsets.length).toBeGreaterThan(0)

    fieldsets.forEach(fieldset => {
      const legend = fieldset.querySelector('legend')
      expect(legend).toBeInTheDocument()
    })

    // Check for proper label associations
    const inputs = container.querySelectorAll('input')
    inputs.forEach(input => {
      if (input.type !== 'hidden') {
        const label = container.querySelector(`label[for="${input.id}"]`)
        expect(label || input.getAttribute('aria-label')).toBeTruthy()
      }
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA live regions', async () => {
    const { container } = render(
      <TestWrapper>
        <div>
          <div id="aria-live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
          <div id="aria-live-region-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
          <PensionCalculator />
        </div>
      </TestWrapper>
    )

    // Check for ARIA live regions
    expect(container.querySelector('#aria-live-region[aria-live="polite"]')).toBeInTheDocument()
    expect(container.querySelector('#aria-live-region-assertive[aria-live="assertive"]')).toBeInTheDocument()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('Color Contrast Accessibility', () => {
    it('should have accessible color palette that meets WCAG AA standards', () => {
      const colorTests = [
        // Primary colors against white background
        { foreground: accessibleColors.primary[600], background: '#ffffff', name: 'Primary 600 on white' },
        { foreground: accessibleColors.primary[700], background: '#ffffff', name: 'Primary 700 on white' },
        { foreground: accessibleColors.primary[800], background: '#ffffff', name: 'Primary 800 on white' },

        // Success colors against white background
        { foreground: accessibleColors.success[500], background: '#ffffff', name: 'Success 500 on white' },
        { foreground: accessibleColors.success[600], background: '#ffffff', name: 'Success 600 on white' },

        // Warning colors against white background
        { foreground: accessibleColors.warning[500], background: '#ffffff', name: 'Warning 500 on white' },
        { foreground: accessibleColors.warning[600], background: '#ffffff', name: 'Warning 600 on white' },

        // Error colors against white background
        { foreground: accessibleColors.error[500], background: '#ffffff', name: 'Error 500 on white' },
        { foreground: accessibleColors.error[600], background: '#ffffff', name: 'Error 600 on white' },

        // Neutral colors against white background
        { foreground: accessibleColors.neutral[600], background: '#ffffff', name: 'Neutral 600 on white' },
        { foreground: accessibleColors.neutral[700], background: '#ffffff', name: 'Neutral 700 on white' },
        { foreground: accessibleColors.neutral[800], background: '#ffffff', name: 'Neutral 800 on white' },
      ]

      const validation = validateColorAccessibility(colorTests)

      // Debug failing colors
      if (!validation.passed) {
        console.log('Failing color combinations:')
        validation.results.forEach(result => {
          if (!result.meetsAA) {
            console.log(`❌ ${result.name}: ${result.ratio}:1 (needs 4.5:1)`)
          }
        })
      }

      // All colors should meet AA standards
      expect(validation.passed).toBe(true)

      // Check individual results
      validation.results.forEach(result => {
        expect(result.meetsAA).toBe(true)
        expect(result.ratio).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should validate specific color combinations used in the app', () => {
      // Test common color combinations used in the Massachusetts Retirement System
      const appColorTests = [
        // Button colors
        { foreground: '#ffffff', background: accessibleColors.primary[600], name: 'White text on primary button' },
        { foreground: '#ffffff', background: accessibleColors.success[500], name: 'White text on success button' },
        { foreground: '#ffffff', background: accessibleColors.error[500], name: 'White text on error button' },

        // Text colors
        { foreground: accessibleColors.neutral[800], background: '#ffffff', name: 'Dark text on white' },
        { foreground: accessibleColors.neutral[700], background: '#ffffff', name: 'Medium dark text on white' },

        // Link colors
        { foreground: accessibleColors.primary[700], background: '#ffffff', name: 'Primary link on white' },

        // Alert backgrounds
        { foreground: accessibleColors.primary[800], background: accessibleColors.primary[50], name: 'Dark primary on light primary' },
        { foreground: accessibleColors.success[800], background: accessibleColors.success[50], name: 'Dark success on light success' },
        { foreground: accessibleColors.warning[800], background: accessibleColors.warning[50], name: 'Dark warning on light warning' },
        { foreground: accessibleColors.error[800], background: accessibleColors.error[50], name: 'Dark error on light error' },
      ]

      const validation = validateColorAccessibility(appColorTests)

      // Debug failing colors
      if (!validation.passed) {
        console.log('Failing app color combinations:')
        validation.results.forEach(result => {
          if (!result.meetsAA) {
            console.log(`❌ ${result.name}: ${result.ratio}:1 (needs 4.5:1)`)
          }
        })
      }

      // All app colors should meet AA standards
      expect(validation.passed).toBe(true)

      validation.results.forEach(result => {
        if (!result.meetsAA) {
          console.warn(`Color combination "${result.name}" does not meet AA standards:`, result)
        }
        expect(result.meetsAA).toBe(true)
      })
    })

    it('should provide accessible alternatives for insufficient contrast', () => {
      // Test that our contrast checking functions work correctly
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AA')).toBe(true) // Black on white
      expect(meetsContrastRequirement('#ffffff', '#000000', 'AA')).toBe(true) // White on black
      expect(meetsContrastRequirement('#777777', '#ffffff', 'AA')).toBe(false) // Light gray on white (insufficient)
      expect(meetsContrastRequirement(accessibleColors.neutral[600], '#ffffff', 'AA')).toBe(true) // Our accessible gray
    })
  })
})
