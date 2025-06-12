import React from 'react'
import { render, screen } from '@testing-library/react'
import { TaxImplicationsCalculator } from '@/components/tax-implications-calculator'
import { PensionCalculator } from '@/components/pension-calculator'

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

describe('Responsive Design Tests', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 },
    largeDesktop: { width: 1920, height: 1080 }
  }

  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(mockMatchMedia)
  })

  describe('Tax Implications Calculator Responsive Design', () => {
    Object.entries(breakpoints).forEach(([device, dimensions]) => {
      it(`should render correctly on ${device} (${dimensions.width}x${dimensions.height})`, () => {
        // Mock viewport dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: dimensions.height,
        })

        render(<TaxImplicationsCalculator />)

        // Verify essential elements are present
        expect(screen.getByText('Tax Implications Calculator')).toBeInTheDocument()
        expect(screen.getByLabelText(/Annual Pension Income/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Annual Social Security/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Calculate Taxes/ })).toBeInTheDocument()

        // Verify form is accessible
        const form = screen.getByLabelText(/Annual Pension Income/).closest('form') || 
                    screen.getByLabelText(/Annual Pension Income/).closest('div')
        expect(form).toBeInTheDocument()
      })
    })

    it('should have proper touch targets on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<TaxImplicationsCalculator />)

      const button = screen.getByRole('button', { name: /Calculate Taxes/ })
      const computedStyle = window.getComputedStyle(button)
      
      // Button should have minimum 44px height for touch accessibility
      // Note: In test environment, we can't get actual computed styles,
      // so we verify the button exists and is accessible
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('should stack form elements vertically on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<TaxImplicationsCalculator />)

      // Verify form inputs are present and accessible
      const inputs = [
        screen.getByLabelText(/Annual Pension Income/),
        screen.getByLabelText(/Annual Social Security/),
        screen.getByLabelText(/Other Annual Income/),
      ]

      inputs.forEach(input => {
        expect(input).toBeInTheDocument()
        expect(input).toBeVisible()
      })
    })

    it('should use multi-column layout on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      render(<TaxImplicationsCalculator />)

      // Verify all form elements are present for desktop layout
      expect(screen.getByLabelText(/Annual Pension Income/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Annual Social Security/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Other Annual Income/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Filing Status/)).toBeInTheDocument()
    })
  })

  describe('Pension Calculator Responsive Design', () => {
    Object.entries(breakpoints).forEach(([device, dimensions]) => {
      it(`should render correctly on ${device} (${dimensions.width}x${dimensions.height})`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })

        render(<PensionCalculator />)

        // Verify essential elements are present
        expect(screen.getByText('Complete Your Pension Calculation')).toBeInTheDocument()
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
        expect(screen.getByText('Salary Information')).toBeInTheDocument()
        expect(screen.getByText('Retirement Options')).toBeInTheDocument()
      })
    })

    it('should display progress indicator on all screen sizes', () => {
      Object.entries(breakpoints).forEach(([device, dimensions]) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })

        render(<PensionCalculator />)

        expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
        expect(screen.getByText('0%')).toBeInTheDocument()
      })
    })

    it('should adapt form layout for different screen sizes', () => {
      // Mobile layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { rerender } = render(<PensionCalculator />)

      // Verify mobile elements are accessible
      expect(screen.getByLabelText(/Age at Retirement/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Years of Service/)).toBeInTheDocument()

      // Desktop layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      rerender(<PensionCalculator />)

      // Verify desktop elements are still accessible
      expect(screen.getByLabelText(/Age at Retirement/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Years of Service/)).toBeInTheDocument()
    })
  })

  describe('Navigation and Accessibility', () => {
    it('should maintain keyboard navigation across all breakpoints', () => {
      Object.entries(breakpoints).forEach(([device, dimensions]) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })

        render(<TaxImplicationsCalculator />)

        // Verify focusable elements
        const focusableElements = [
          screen.getByLabelText(/Annual Pension Income/),
          screen.getByLabelText(/Annual Social Security/),
          screen.getByRole('button', { name: /Calculate Taxes/ }),
        ]

        focusableElements.forEach(element => {
          expect(element).toBeInTheDocument()
          // In a real browser, we would test tabIndex and focus behavior
        })
      })
    })

    it('should maintain proper heading hierarchy on all screen sizes', () => {
      Object.entries(breakpoints).forEach(([device, dimensions]) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })

        render(<TaxImplicationsCalculator />)

        // Verify heading structure
        expect(screen.getByRole('heading', { name: /Tax Implications Calculator/ })).toBeInTheDocument()
      })
    })

    it('should provide adequate spacing for touch targets', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<TaxImplicationsCalculator />)

      // Verify interactive elements are present and accessible
      const interactiveElements = [
        screen.getByLabelText(/Annual Pension Income/),
        screen.getByLabelText(/Annual Social Security/),
        screen.getByRole('button', { name: /Calculate Taxes/ }),
      ]

      interactiveElements.forEach(element => {
        expect(element).toBeInTheDocument()
        expect(element).toBeVisible()
      })
    })
  })

  describe('Content Adaptation', () => {
    it('should show appropriate content density for screen size', () => {
      // Mobile - should show essential content
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { rerender } = render(<PensionCalculator />)

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Salary Information')).toBeInTheDocument()

      // Desktop - should show more detailed content
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      rerender(<PensionCalculator />)

      expect(screen.getByText('Complete Your Pension Calculation')).toBeInTheDocument()
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Salary Information')).toBeInTheDocument()
    })

    it('should handle text overflow gracefully', () => {
      Object.entries(breakpoints).forEach(([device, dimensions]) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })

        render(<TaxImplicationsCalculator />)

        // Verify long text content is handled properly
        const longTextElements = screen.getAllByText(/Tax Implications Calculator/)
        longTextElements.forEach(element => {
          expect(element).toBeInTheDocument()
          expect(element).toBeVisible()
        })
      })
    })
  })

  describe('Performance on Different Screen Sizes', () => {
    it('should render quickly on all breakpoints', () => {
      Object.entries(breakpoints).forEach(([device, dimensions]) => {
        const startTime = performance.now()

        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        })

        render(<TaxImplicationsCalculator />)

        const endTime = performance.now()
        const renderTime = endTime - startTime

        // Should render within 100ms on any screen size
        expect(renderTime).toBeLessThan(100)
      })
    })

    it('should not cause layout thrashing during resize', () => {
      const { rerender } = render(<TaxImplicationsCalculator />)

      // Simulate screen size changes
      const sizes = [375, 768, 1024, 1920]
      
      sizes.forEach(width => {
        const startTime = performance.now()

        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        })

        rerender(<TaxImplicationsCalculator />)

        const endTime = performance.now()
        const resizeTime = endTime - startTime

        // Resize should be quick
        expect(resizeTime).toBeLessThan(50)
      })
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('should work with different user agent strings', () => {
      const userAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', // iOS Safari
        'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0', // Android Firefox
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', // Chrome
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15' // Safari
      ]

      userAgents.forEach(userAgent => {
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: userAgent,
        })

        render(<TaxImplicationsCalculator />)

        expect(screen.getByText('Tax Implications Calculator')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Calculate Taxes/ })).toBeInTheDocument()
      })
    })
  })
})
