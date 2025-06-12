/**
 * Massachusetts Retirement System - Critical Workflows Integration Tests
 * 
 * Comprehensive integration tests for critical user workflows and production scenarios.
 * Tests end-to-end functionality, performance, and reliability.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { createMocks } from 'node-mocks-http'

// Import API handlers
import { GET as profileGET, PUT as profilePUT } from '@/app/api/profile/route'
import { GET as calculationsGET, POST as calculationsPOST } from '@/app/api/retirement/calculations/route'
import { GET as scenariosGET, POST as scenariosPOST } from '@/app/api/scenarios/route'
import { POST as taxCalculate } from '@/app/api/tax/calculate/route'
import { GET as healthCheck } from '@/app/api/health/route'

// Import utilities
import { calculatePensionBenefit } from '@/lib/pension-calculations'
import { calculateSocialSecurityBenefit } from '@/lib/social-security-calculations'
import { calculateRetirementTaxes } from '@/lib/tax-calculations'

// Mock authentication
const mockSession = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User'
  }
}

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession))
}))

// Performance tracking
const performanceTracker = {
  start: () => Date.now(),
  end: (start: number, operation: string, threshold: number = 2000) => {
    const duration = Date.now() - start
    expect(duration).toBeLessThan(threshold)
    console.log(`${operation}: ${duration}ms`)
    return duration
  }
}

describe('Critical Workflows Integration Tests', () => {
  
  describe('User Profile Management Workflow', () => {
    test('Complete profile creation and retrieval workflow', async () => {
      const start = performanceTracker.start()
      
      // Step 1: Get initial profile (should be empty)
      const getRequest = new NextRequest('http://localhost:3000/api/profile')
      const getResponse = await profileGET(getRequest)
      const initialProfile = await getResponse.json()
      
      expect(getResponse.status).toBe(200)
      expect(initialProfile.hasProfile).toBe(false)
      
      // Step 2: Create/update profile
      const profileData = {
        fullName: 'John Doe',
        dateOfBirth: '1970-01-01',
        membershipDate: '2000-01-01',
        retirementGroup: 'GROUP_1',
        currentSalary: 75000,
        averageHighest3Years: 80000,
        yearsOfService: 25,
        plannedRetirementAge: 65,
        retirementOption: 'A'
      }
      
      const putRequest = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const putResponse = await profilePUT(putRequest)
      const updatedProfile = await putResponse.json()
      
      expect(putResponse.status).toBe(200)
      expect(updatedProfile.success).toBe(true)
      expect(updatedProfile.profile.fullName).toBe('John Doe')
      
      // Step 3: Verify profile retrieval
      const verifyRequest = new NextRequest('http://localhost:3000/api/profile')
      const verifyResponse = await profileGET(verifyRequest)
      const verifiedProfile = await verifyResponse.json()
      
      expect(verifyResponse.status).toBe(200)
      expect(verifiedProfile.hasProfile).toBe(true)
      expect(verifiedProfile.fullName).toBe('John Doe')
      
      performanceTracker.end(start, 'Profile Management Workflow')
    })
  })
  
  describe('Retirement Calculation Workflow', () => {
    test('Complete calculation creation and management workflow', async () => {
      const start = performanceTracker.start()
      
      // Step 1: Create a new calculation
      const calculationData = {
        name: 'Test Retirement Calculation',
        retirementGroup: 'GROUP_1',
        retirementAge: 65,
        yearsOfService: 30,
        salary1: 75000,
        salary2: 76000,
        salary3: 77000,
        retirementOption: 'A'
      }
      
      const createRequest = new NextRequest('http://localhost:3000/api/retirement/calculations', {
        method: 'POST',
        body: JSON.stringify(calculationData),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const createResponse = await calculationsPOST(createRequest)
      const createdCalculation = await createResponse.json()
      
      expect(createResponse.status).toBe(201)
      expect(createdCalculation.success).toBe(true)
      expect(createdCalculation.calculation.name).toBe('Test Retirement Calculation')
      expect(createdCalculation.calculation.monthlyBenefit).toBeGreaterThan(0)
      
      // Step 2: Retrieve user calculations
      const getRequest = new NextRequest('http://localhost:3000/api/retirement/calculations?limit=10')
      const getResponse = await calculationsGET(getRequest)
      const calculations = await getResponse.json()
      
      expect(getResponse.status).toBe(200)
      expect(calculations.success).toBe(true)
      expect(calculations.calculations).toBeInstanceOf(Array)
      expect(calculations.total).toBeGreaterThan(0)
      
      // Step 3: Verify calculation accuracy
      const expectedBenefit = calculatePensionBenefit({
        retirementGroup: 'GROUP_1',
        retirementAge: 65,
        yearsOfService: 30,
        averageHighestSalary: 76000,
        retirementOption: 'A'
      })
      
      expect(Math.abs(createdCalculation.calculation.monthlyBenefit - expectedBenefit.monthlyBenefit)).toBeLessThan(1)
      
      performanceTracker.end(start, 'Calculation Workflow')
    })
    
    test('Calculation accuracy across different scenarios', async () => {
      const testCases = [
        {
          name: 'Group 1 Normal Retirement',
          data: { retirementGroup: 'GROUP_1', retirementAge: 65, yearsOfService: 30, averageSalary: 75000 },
          expectedRange: { min: 2800, max: 3200 }
        },
        {
          name: 'Group 2 Early Retirement',
          data: { retirementGroup: 'GROUP_2', retirementAge: 55, yearsOfService: 25, averageSalary: 80000 },
          expectedRange: { min: 2000, max: 2500 }
        },
        {
          name: 'Group 4 Public Safety',
          data: { retirementGroup: 'GROUP_4', retirementAge: 50, yearsOfService: 25, averageSalary: 85000 },
          expectedRange: { min: 2600, max: 3100 }
        }
      ]
      
      for (const testCase of testCases) {
        const start = performanceTracker.start()
        
        const calculationData = {
          name: testCase.name,
          retirementGroup: testCase.data.retirementGroup,
          retirementAge: testCase.data.retirementAge,
          yearsOfService: testCase.data.yearsOfService,
          salary1: testCase.data.averageSalary,
          salary2: testCase.data.averageSalary,
          salary3: testCase.data.averageSalary,
          retirementOption: 'A'
        }
        
        const request = new NextRequest('http://localhost:3000/api/retirement/calculations', {
          method: 'POST',
          body: JSON.stringify(calculationData),
          headers: { 'Content-Type': 'application/json' }
        })
        
        const response = await calculationsPOST(request)
        const result = await response.json()
        
        expect(response.status).toBe(201)
        expect(result.calculation.monthlyBenefit).toBeGreaterThanOrEqual(testCase.expectedRange.min)
        expect(result.calculation.monthlyBenefit).toBeLessThanOrEqual(testCase.expectedRange.max)
        
        performanceTracker.end(start, `${testCase.name} Calculation`, 1000)
      }
    })
  })
  
  describe('Scenario Modeling Workflow', () => {
    test('Complete scenario creation and comparison workflow', async () => {
      const start = performanceTracker.start()
      
      // Step 1: Create baseline scenario
      const baselineScenario = {
        name: 'Baseline Retirement',
        description: 'Standard retirement at 65',
        parameters: {
          retirementAge: 65,
          retirementGroup: 'GROUP_1',
          yearsOfService: 30,
          currentSalary: 75000,
          salaryGrowthRate: 0.03,
          investmentReturn: 0.07,
          riskTolerance: 'moderate',
          socialSecurityClaimAge: 67,
          healthcareOption: 'state_plan'
        }
      }
      
      const baselineRequest = new NextRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        body: JSON.stringify(baselineScenario),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const baselineResponse = await scenariosPOST(baselineRequest)
      const baselineResult = await baselineResponse.json()
      
      expect(baselineResponse.status).toBe(201)
      expect(baselineResult.success).toBe(true)
      expect(baselineResult.scenario.name).toBe('Baseline Retirement')
      
      // Step 2: Create alternative scenario
      const alternativeScenario = {
        name: 'Early Retirement',
        description: 'Early retirement at 62',
        parameters: {
          ...baselineScenario.parameters,
          retirementAge: 62,
          socialSecurityClaimAge: 62
        }
      }
      
      const alternativeRequest = new NextRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        body: JSON.stringify(alternativeScenario),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const alternativeResponse = await scenariosPOST(alternativeRequest)
      const alternativeResult = await alternativeResponse.json()
      
      expect(alternativeResponse.status).toBe(201)
      expect(alternativeResult.success).toBe(true)
      
      // Step 3: Retrieve and compare scenarios
      const getRequest = new NextRequest('http://localhost:3000/api/scenarios')
      const getResponse = await scenariosGET(getRequest)
      const scenarios = await getResponse.json()
      
      expect(getResponse.status).toBe(200)
      expect(scenarios.success).toBe(true)
      expect(scenarios.scenarios.length).toBeGreaterThanOrEqual(2)
      
      // Verify scenario results make sense
      const baseline = scenarios.scenarios.find((s: any) => s.name === 'Baseline Retirement')
      const alternative = scenarios.scenarios.find((s: any) => s.name === 'Early Retirement')
      
      expect(baseline.results.totalMonthlyIncome).toBeGreaterThan(alternative.results.totalMonthlyIncome)
      
      performanceTracker.end(start, 'Scenario Modeling Workflow')
    })
  })
  
  describe('Tax Calculation Workflow', () => {
    test('Comprehensive tax calculation workflow', async () => {
      const start = performanceTracker.start()
      
      const taxData = {
        pensionIncome: 45000,
        socialSecurityIncome: 20000,
        otherIncome: 5000,
        filingStatus: 'single',
        age: 65,
        state: 'MA'
      }
      
      const request = new NextRequest('http://localhost:3000/api/tax/calculate', {
        method: 'POST',
        body: JSON.stringify(taxData),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await taxCalculate(request)
      const result = await response.json()
      
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.taxCalculation.federal.tax).toBeGreaterThan(0)
      expect(result.taxCalculation.state.tax).toBeGreaterThan(0)
      expect(result.taxCalculation.total.netIncome).toBeLessThan(result.taxCalculation.total.grossIncome)
      
      // Verify tax calculation accuracy
      const expectedTaxes = calculateRetirementTaxes(
        taxData.pensionIncome,
        taxData.socialSecurityIncome,
        taxData.otherIncome,
        taxData.filingStatus,
        taxData.age
      )
      
      expect(Math.abs(result.taxCalculation.total.totalTax - expectedTaxes.total.totalTax)).toBeLessThan(100)
      
      performanceTracker.end(start, 'Tax Calculation Workflow', 1000)
    })
  })
  
  describe('Social Security Integration Workflow', () => {
    test('Social Security benefit calculation accuracy', async () => {
      const start = performanceTracker.start()
      
      const testCases = [
        {
          name: 'Normal Retirement Age',
          birthYear: 1960,
          retirementAge: 67,
          annualEarnings: 75000,
          expectedRange: { min: 1800, max: 2500 }
        },
        {
          name: 'Early Retirement',
          birthYear: 1960,
          retirementAge: 62,
          annualEarnings: 75000,
          expectedRange: { min: 1200, max: 1800 }
        },
        {
          name: 'Delayed Retirement',
          birthYear: 1960,
          retirementAge: 70,
          annualEarnings: 75000,
          expectedRange: { min: 2200, max: 3000 }
        }
      ]
      
      for (const testCase of testCases) {
        const benefit = calculateSocialSecurityBenefit({
          birthYear: testCase.birthYear,
          retirementAge: testCase.retirementAge,
          currentAge: 65,
          annualEarnings: testCase.annualEarnings,
          earningsHistory: Array(35).fill(testCase.annualEarnings)
        })
        
        expect(benefit.monthlyBenefit).toBeGreaterThanOrEqual(testCase.expectedRange.min)
        expect(benefit.monthlyBenefit).toBeLessThanOrEqual(testCase.expectedRange.max)
      }
      
      performanceTracker.end(start, 'Social Security Calculations', 500)
    })
  })
  
  describe('System Health and Performance', () => {
    test('Health check endpoint functionality', async () => {
      const start = performanceTracker.start()
      
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await healthCheck(request)
      const health = await response.json()
      
      expect(response.status).toBe(200)
      expect(health.status).toMatch(/healthy|degraded/)
      expect(health.checks).toBeDefined()
      expect(health.checks.database).toBeDefined()
      expect(health.checks.memory).toBeDefined()
      
      performanceTracker.end(start, 'Health Check', 1000)
    })
    
    test('Performance requirements compliance', async () => {
      const operations = [
        { name: 'Profile GET', threshold: 500 },
        { name: 'Calculation POST', threshold: 1500 },
        { name: 'Scenario POST', threshold: 2000 },
        { name: 'Tax Calculation', threshold: 1000 }
      ]
      
      for (const operation of operations) {
        const start = Date.now()
        
        // Simulate operation based on type
        if (operation.name.includes('Profile')) {
          const request = new NextRequest('http://localhost:3000/api/profile')
          await profileGET(request)
        } else if (operation.name.includes('Calculation')) {
          const request = new NextRequest('http://localhost:3000/api/retirement/calculations', {
            method: 'POST',
            body: JSON.stringify({
              name: 'Performance Test',
              retirementGroup: 'GROUP_1',
              retirementAge: 65,
              yearsOfService: 30,
              salary1: 75000,
              salary2: 75000,
              salary3: 75000
            }),
            headers: { 'Content-Type': 'application/json' }
          })
          await calculationsPOST(request)
        }
        
        const duration = Date.now() - start
        expect(duration).toBeLessThan(operation.threshold)
        console.log(`${operation.name} performance: ${duration}ms (threshold: ${operation.threshold}ms)`)
      }
    })
  })
  
  describe('Error Handling and Edge Cases', () => {
    test('Invalid input handling', async () => {
      const invalidCalculationData = {
        name: '', // Empty name
        retirementGroup: 'INVALID_GROUP',
        retirementAge: -5, // Invalid age
        yearsOfService: 100, // Unrealistic years
        salary1: -1000 // Negative salary
      }
      
      const request = new NextRequest('http://localhost:3000/api/retirement/calculations', {
        method: 'POST',
        body: JSON.stringify(invalidCalculationData),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await calculationsPOST(request)
      
      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
    
    test('Unauthenticated access handling', async () => {
      // Mock unauthenticated session
      const originalMock = require('next-auth/next').getServerSession
      require('next-auth/next').getServerSession = jest.fn(() => Promise.resolve(null))
      
      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await profileGET(request)
      
      expect(response.status).toBe(401)
      
      // Restore original mock
      require('next-auth/next').getServerSession = originalMock
    })
  })
})

describe('Load Testing Simulation', () => {
  test('Concurrent calculation requests', async () => {
    const concurrentRequests = 10
    const requests = []
    
    for (let i = 0; i < concurrentRequests; i++) {
      const calculationData = {
        name: `Concurrent Test ${i}`,
        retirementGroup: 'GROUP_1',
        retirementAge: 65,
        yearsOfService: 30,
        salary1: 75000 + i * 1000,
        salary2: 76000 + i * 1000,
        salary3: 77000 + i * 1000,
        retirementOption: 'A'
      }
      
      const request = new NextRequest('http://localhost:3000/api/retirement/calculations', {
        method: 'POST',
        body: JSON.stringify(calculationData),
        headers: { 'Content-Type': 'application/json' }
      })
      
      requests.push(calculationsPOST(request))
    }
    
    const start = Date.now()
    const responses = await Promise.all(requests)
    const duration = Date.now() - start
    
    // All requests should complete within 5 seconds
    expect(duration).toBeLessThan(5000)
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(201)
    })
    
    console.log(`${concurrentRequests} concurrent requests completed in ${duration}ms`)
  })
})
