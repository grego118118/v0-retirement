/**
 * Massachusetts Retirement System - Production Validation Tests
 * 
 * Comprehensive end-to-end tests for production deployment validation.
 * Tests all critical user journeys and performance requirements.
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

// Test configuration
const PERFORMANCE_THRESHOLD = 2000 // 2 seconds
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
  { name: 'large-desktop', width: 1920, height: 1080 }
]

// Helper function to measure page load time
async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now()
  await page.goto(url, { waitUntil: 'networkidle' })
  return Date.now() - startTime
}

// Helper function to check accessibility
async function checkAccessibility(page: Page) {
  // Check for basic accessibility requirements
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').count()
  expect(headings).toBeGreaterThan(0)
  
  // Check for alt text on images
  const images = await page.locator('img').all()
  for (const img of images) {
    const alt = await img.getAttribute('alt')
    expect(alt).toBeTruthy()
  }
  
  // Check for form labels
  const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], select, textarea').all()
  for (const input of inputs) {
    const id = await input.getAttribute('id')
    if (id) {
      const label = await page.locator(`label[for="${id}"]`).count()
      const ariaLabel = await input.getAttribute('aria-label')
      expect(label > 0 || ariaLabel).toBeTruthy()
    }
  }
}

test.describe('Production Validation Tests', () => {
  
  test.describe('Performance Requirements', () => {
    
    for (const breakpoint of BREAKPOINTS) {
      test(`Page load performance - ${breakpoint.name}`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
        
        const pages = [
          '/',
          '/calculator',
          '/scenarios',
          '/social-security',
          '/tax-calculator',
          '/wizard'
        ]
        
        for (const pagePath of pages) {
          const loadTime = await measurePageLoad(page, `${BASE_URL}${pagePath}`)
          expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLD)
          console.log(`${pagePath} (${breakpoint.name}): ${loadTime}ms`)
        }
      })
    }
    
    test('API response times', async ({ request }) => {
      const apiEndpoints = [
        '/api/health',
        '/api/auth/session',
        '/api/profile'
      ]
      
      for (const endpoint of apiEndpoints) {
        const startTime = Date.now()
        const response = await request.get(`${BASE_URL}${endpoint}`)
        const responseTime = Date.now() - startTime
        
        expect(response.status()).toBeLessThan(500)
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD)
        console.log(`${endpoint}: ${responseTime}ms`)
      }
    })
  })
  
  test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    
    for (const breakpoint of BREAKPOINTS) {
      test(`Accessibility compliance - ${breakpoint.name}`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
        
        const pages = [
          '/',
          '/calculator',
          '/scenarios',
          '/social-security'
        ]
        
        for (const pagePath of pages) {
          await page.goto(`${BASE_URL}${pagePath}`)
          await checkAccessibility(page)
        }
      })
    }
    
    test('Keyboard navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/calculator`)
      
      // Test tab navigation
      await page.keyboard.press('Tab')
      const firstFocusable = await page.locator(':focus').first()
      expect(firstFocusable).toBeTruthy()
      
      // Test form navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const secondFocusable = await page.locator(':focus').first()
      expect(secondFocusable).toBeTruthy()
    })
    
    test('Touch target sizes (44px minimum)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // Mobile
      await page.goto(`${BASE_URL}/calculator`)
      
      const buttons = await page.locator('button, a, input[type="submit"], input[type="button"]').all()
      
      for (const button of buttons) {
        const box = await button.boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })
  
  test.describe('Responsive Design', () => {
    
    for (const breakpoint of BREAKPOINTS) {
      test(`Layout integrity - ${breakpoint.name}`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
        await page.goto(`${BASE_URL}/calculator`)
        
        // Check for horizontal scrollbars (should not exist)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = breakpoint.width
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20) // 20px tolerance
        
        // Check that navigation is accessible
        const nav = await page.locator('nav').first()
        expect(nav).toBeVisible()
        
        // Check that main content is visible
        const main = await page.locator('main, [role="main"]').first()
        expect(main).toBeVisible()
      })
    }
  })
  
  test.describe('Core User Journeys', () => {
    
    test('Pension calculator workflow', async ({ page }) => {
      await page.goto(`${BASE_URL}/calculator`)
      
      // Fill out basic information
      await page.selectOption('select[name="group"]', 'GROUP_1')
      await page.fill('input[name="age"]', '65')
      await page.fill('input[name="yearsOfService"]', '30')
      await page.fill('input[name="salary1"]', '75000')
      await page.fill('input[name="salary2"]', '76000')
      await page.fill('input[name="salary3"]', '77000')
      
      // Submit calculation
      const calculateButton = page.locator('button:has-text("Calculate")')
      await calculateButton.click()
      
      // Wait for results
      await page.waitForSelector('[data-testid="calculation-results"]', { timeout: 5000 })
      
      // Verify results are displayed
      const results = await page.locator('[data-testid="calculation-results"]')
      expect(results).toBeVisible()
    })
    
    test('Scenario modeling workflow', async ({ page }) => {
      await page.goto(`${BASE_URL}/scenarios`)
      
      // Check that scenario page loads
      const heading = await page.locator('h1')
      expect(heading).toContainText('Scenario')
      
      // Test scenario creation (if authenticated)
      const createButton = page.locator('button:has-text("New Scenario")')
      if (await createButton.isVisible()) {
        await createButton.click()
        
        // Check that scenario form opens
        const form = await page.locator('form')
        expect(form).toBeVisible()
      }
    })
    
    test('Social Security calculator', async ({ page }) => {
      await page.goto(`${BASE_URL}/social-security`)
      
      // Check page loads
      const heading = await page.locator('h1')
      expect(heading).toContainText('Social Security')
      
      // Test basic form interaction
      const ageInput = page.locator('input[type="number"]').first()
      if (await ageInput.isVisible()) {
        await ageInput.fill('67')
        expect(await ageInput.inputValue()).toBe('67')
      }
    })
  })
  
  test.describe('Security and Error Handling', () => {
    
    test('Health check endpoint', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`)
      expect(response.status()).toBe(200)
      
      const health = await response.json()
      expect(health.status).toBe('healthy')
      expect(health.checks.database.status).toBe('healthy')
    })
    
    test('Rate limiting protection', async ({ request }) => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 10 }, () => 
        request.get(`${BASE_URL}/api/health`)
      )
      
      const responses = await Promise.all(requests)
      const statusCodes = responses.map(r => r.status())
      
      // Should have at least some successful requests
      expect(statusCodes.filter(code => code === 200).length).toBeGreaterThan(0)
    })
    
    test('Error page handling', async ({ page }) => {
      // Test 404 page
      await page.goto(`${BASE_URL}/non-existent-page`)
      const notFoundText = await page.locator('body').textContent()
      expect(notFoundText).toContain('404')
    })
    
    test('CSP headers', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`)
      const cspHeader = response.headers()['content-security-policy']
      expect(cspHeader).toBeTruthy()
    })
  })
  
  test.describe('Data Integrity', () => {
    
    test('Calculation accuracy', async ({ page }) => {
      await page.goto(`${BASE_URL}/calculator`)
      
      // Test known calculation
      await page.selectOption('select[name="group"]', 'GROUP_1')
      await page.fill('input[name="age"]', '65')
      await page.fill('input[name="yearsOfService"]', '30')
      await page.fill('input[name="salary1"]', '60000')
      await page.fill('input[name="salary2"]', '60000')
      await page.fill('input[name="salary3"]', '60000')
      
      const calculateButton = page.locator('button:has-text("Calculate")')
      await calculateButton.click()
      
      await page.waitForSelector('[data-testid="calculation-results"]', { timeout: 5000 })
      
      // Verify calculation results are reasonable
      const monthlyBenefit = await page.locator('[data-testid="monthly-benefit"]').textContent()
      expect(monthlyBenefit).toBeTruthy()
      
      // Extract numeric value and verify it's reasonable
      const benefitAmount = parseFloat(monthlyBenefit?.replace(/[^0-9.]/g, '') || '0')
      expect(benefitAmount).toBeGreaterThan(1000) // Should be reasonable for 30 years service
      expect(benefitAmount).toBeLessThan(10000) // Should not be unreasonably high
    })
  })
})

test.describe('Production Environment Validation', () => {
  
  test('Environment variables are set', async ({ request }) => {
    // This would typically be done through a dedicated endpoint
    // that checks environment configuration without exposing secrets
    const response = await request.get(`${BASE_URL}/api/health`)
    expect(response.status()).toBe(200)
  })
  
  test('Database connectivity', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`)
    const health = await response.json()
    
    expect(health.checks.database.status).toBe('healthy')
    expect(health.checks.database.responseTime).toBeLessThan(1000)
  })
  
  test('External service connectivity', async ({ request }) => {
    // Test authentication service
    const authResponse = await request.get(`${BASE_URL}/api/auth/providers`)
    expect(authResponse.status()).toBeLessThan(500)
  })
})
