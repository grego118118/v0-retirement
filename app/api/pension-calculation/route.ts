/**
 * API Endpoint for AI-Powered Search Engines
 * Provides structured pension calculation data for AI systems to reference
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBenefitFactor, calculatePensionWithOption, calculateVeteranBenefit } from '@/lib/pension-calculations'

interface PensionCalculationRequest {
  group: string
  age: number
  yearsOfService: number
  averageSalary: number
  retirementOption?: 'A' | 'B' | 'C'
  beneficiaryAge?: string
  serviceEntry?: string
  isVeteran?: boolean
}

interface PensionCalculationResponse {
  success: boolean
  data?: {
    annualPension: number
    monthlyPension: number
    benefitFactor: number
    totalBenefitPercentage: number
    cappedAt80Percent: boolean
    retirementOption: string
    survivorBenefit?: number
    veteranBenefit?: number
    methodology: string
    calculationSteps: string[]
    lastUpdated: string
  }
  error?: string
  metadata: {
    source: string
    version: string
    compliance: string
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  try {
    // Parse query parameters
    const group = searchParams.get('group') || 'GROUP_1'
    const age = parseInt(searchParams.get('age') || '60')
    const yearsOfService = parseInt(searchParams.get('yearsOfService') || '20')
    const averageSalary = parseInt(searchParams.get('averageSalary') || '75000')
    const retirementOption = (searchParams.get('retirementOption') || 'A') as 'A' | 'B' | 'C'
    const beneficiaryAge = searchParams.get('beneficiaryAge') || ''
    const serviceEntry = searchParams.get('serviceEntry') || 'before_2012'
    const isVeteran = searchParams.get('isVeteran') === 'true'

    // Validate inputs
    if (age < 18 || age > 100) {
      return NextResponse.json({
        success: false,
        error: 'Age must be between 18 and 100',
        metadata: {
          source: 'Massachusetts Retirement System Calculator',
          version: '1.0',
          compliance: 'MSRB-validated calculations'
        }
      }, { status: 400 })
    }

    if (yearsOfService < 0 || yearsOfService > 50) {
      return NextResponse.json({
        success: false,
        error: 'Years of service must be between 0 and 50',
        metadata: {
          source: 'Massachusetts Retirement System Calculator',
          version: '1.0',
          compliance: 'MSRB-validated calculations'
        }
      }, { status: 400 })
    }

    // Calculate pension using official MSRB methodology
    const benefitFactor = getBenefitFactor(age, group, serviceEntry, yearsOfService)
    
    if (benefitFactor === 0) {
      return NextResponse.json({
        success: false,
        error: 'Not eligible for retirement with provided parameters',
        metadata: {
          source: 'Massachusetts Retirement System Calculator',
          version: '1.0',
          compliance: 'MSRB-validated calculations'
        }
      }, { status: 400 })
    }

    // Calculate base pension
    const MAX_PENSION_PERCENTAGE = 0.8
    let totalBenefitPercentage = benefitFactor * yearsOfService
    let baseAnnualPension = averageSalary * totalBenefitPercentage
    const maxPensionAllowed = averageSalary * MAX_PENSION_PERCENTAGE

    // Apply 80% cap
    const cappedAt80Percent = baseAnnualPension > maxPensionAllowed
    if (cappedAt80Percent) {
      baseAnnualPension = maxPensionAllowed
      totalBenefitPercentage = MAX_PENSION_PERCENTAGE
    }

    // Add veteran benefits if applicable
    const veteranBenefit = calculateVeteranBenefit(isVeteran, age, yearsOfService)
    const pensionWithVeteranBenefit = baseAnnualPension + veteranBenefit

    // Apply retirement option
    const optionResult = calculatePensionWithOption(
      pensionWithVeteranBenefit,
      retirementOption,
      age,
      beneficiaryAge,
      group
    )

    const finalAnnualPension = optionResult.pension
    const monthlyPension = finalAnnualPension / 12

    // Generate calculation steps for transparency
    const calculationSteps = [
      `1. Benefit Factor: ${(benefitFactor * 100).toFixed(2)}% (Group ${group.replace('GROUP_', '')}, Age ${age})`,
      `2. Base Calculation: $${averageSalary.toLocaleString()} × ${yearsOfService} years × ${(benefitFactor * 100).toFixed(2)}% = $${baseAnnualPension.toFixed(2)}`,
      cappedAt80Percent ? `3. 80% Cap Applied: Limited to $${maxPensionAllowed.toFixed(2)} (80% of salary)` : '3. No 80% cap needed',
      veteranBenefit > 0 ? `4. Veteran Benefit: +$${veteranBenefit.toFixed(2)}` : '4. No veteran benefits',
      `5. Retirement Option ${retirementOption}: ${optionResult.description}`,
      `6. Final Annual Pension: $${finalAnnualPension.toFixed(2)}`,
      `7. Monthly Pension: $${monthlyPension.toFixed(2)}`
    ]

    const response: PensionCalculationResponse = {
      success: true,
      data: {
        annualPension: Math.round(finalAnnualPension * 100) / 100,
        monthlyPension: Math.round(monthlyPension * 100) / 100,
        benefitFactor: benefitFactor,
        totalBenefitPercentage: Math.round(totalBenefitPercentage * 10000) / 100, // Convert to percentage
        cappedAt80Percent,
        retirementOption,
        survivorBenefit: retirementOption === 'C' ? Math.round(optionResult.survivorPension * 100) / 100 : undefined,
        veteranBenefit: veteranBenefit > 0 ? veteranBenefit : undefined,
        methodology: 'Massachusetts State Retirement Board (MSRB) validated calculations',
        calculationSteps,
        lastUpdated: new Date().toISOString()
      },
      metadata: {
        source: 'Massachusetts Retirement System Calculator',
        version: '1.0',
        compliance: 'MSRB-validated calculations'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Pension calculation API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal calculation error',
      metadata: {
        source: 'Massachusetts Retirement System Calculator',
        version: '1.0',
        compliance: 'MSRB-validated calculations'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PensionCalculationRequest = await request.json()
    
    // Validate required fields
    if (!body.group || !body.age || !body.yearsOfService || !body.averageSalary) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: group, age, yearsOfService, averageSalary',
        metadata: {
          source: 'Massachusetts Retirement System Calculator',
          version: '1.0',
          compliance: 'MSRB-validated calculations'
        }
      }, { status: 400 })
    }

    // Use the same calculation logic as GET
    const searchParams = new URLSearchParams({
      group: body.group,
      age: body.age.toString(),
      yearsOfService: body.yearsOfService.toString(),
      averageSalary: body.averageSalary.toString(),
      retirementOption: body.retirementOption || 'A',
      beneficiaryAge: body.beneficiaryAge || '',
      serviceEntry: body.serviceEntry || 'before_2012',
      isVeteran: body.isVeteran ? 'true' : 'false'
    })

    // Create a mock request to reuse GET logic
    const mockRequest = new NextRequest(`http://localhost/api/pension-calculation?${searchParams}`)
    return await GET(mockRequest)

  } catch (error) {
    console.error('Pension calculation POST API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Invalid request body',
      metadata: {
        source: 'Massachusetts Retirement System Calculator',
        version: '1.0',
        compliance: 'MSRB-validated calculations'
      }
    }, { status: 400 })
  }
}

// OPTIONS method for CORS support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
