"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  TestTube, 
  Eye,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

import { EssentialInformationStep } from "./essential-information-step"
import { WizardNavigationV2 } from "./wizard-navigation-v2"
import { EnhancedCalculationPreview } from "./enhanced-calculation-preview"
import { WizardTestHelper } from "./wizard-test-helper"

import { 
  EssentialInfoData, 
  WizardProgressV2,
  CombinedCalculationDataV2 
} from "@/lib/wizard/wizard-types-v2"
import { 
  generateSmartDefaults, 
  assessDataQuality,
  validateRetirementAge 
} from "@/lib/wizard/smart-defaults"

interface WizardV2DevProps {
  onClose?: () => void
}

export function WizardV2Dev({ onClose }: WizardV2DevProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<Partial<CombinedCalculationDataV2>>({
    essentialInfo: {
      birthYear: 0,
      currentAge: 0,
      retirementGroup: '1',
      yearsOfService: 0,
      averageSalary: 0,
      plannedRetirementAge: 0,
      serviceEntry: 'before_2012',
      retirementOption: 'A'
    } as EssentialInfoData
  })

  // CRITICAL FIX: Separate pristine user input state that never gets corrupted
  const [userInputValues, setUserInputValues] = useState<Partial<EssentialInfoData>>({})

  // CRITICAL FIX: Separate state for smart defaults (never mixed with user input)
  const [smartDefaultsState, setSmartDefaultsState] = useState<Partial<EssentialInfoData>>({})

  // CRITICAL FIX: Combined state for calculations (user input + smart defaults, but never stored in wizardData)
  const [calculationData, setCalculationData] = useState<Partial<EssentialInfoData>>({})

  // CRITICAL DEBUG: Use refs to track current state values (to avoid closure issues)
  const userInputValuesRef = useRef(userInputValues)
  const wizardDataRef = useRef(wizardData)

  // Update refs whenever state changes
  useEffect(() => {
    userInputValuesRef.current = userInputValues
  }, [userInputValues])

  useEffect(() => {
    wizardDataRef.current = wizardData
  }, [wizardData])

  // INTELLIGENT MONITORING: Track state changes without false positives
  useEffect(() => {
    console.log('🔄 wizardData state changed:', wizardData)
    if (wizardData.essentialInfo) {
      console.log('🔄 essentialInfo in state:', wizardData.essentialInfo)

      // INTELLIGENT VALIDATION: Only flag truly problematic values
      if (wizardData.essentialInfo.yearsOfService !== undefined) {
        console.log('🔄 yearsOfService in state:', wizardData.essentialInfo.yearsOfService, typeof wizardData.essentialInfo.yearsOfService)

        // Only flag clearly invalid values, not user input variations
        if (wizardData.essentialInfo.yearsOfService < 0) {
          console.log('🚨 INVALID DATA: Negative years of service:', wizardData.essentialInfo.yearsOfService)
        } else if (wizardData.essentialInfo.yearsOfService > 50) {
          console.log('⚠️ UNUSUAL DATA: Very high years of service:', wizardData.essentialInfo.yearsOfService)
        } else {
          console.log('✅ VALID DATA: Years of service within reasonable range')
        }
      }

      if (wizardData.essentialInfo.averageSalary !== undefined) {
        console.log('🔄 averageSalary in state:', wizardData.essentialInfo.averageSalary, typeof wizardData.essentialInfo.averageSalary)

        // Only flag clearly invalid values, not user input variations
        if (wizardData.essentialInfo.averageSalary < 0) {
          console.log('🚨 INVALID DATA: Negative salary:', wizardData.essentialInfo.averageSalary)
        } else if (wizardData.essentialInfo.averageSalary > 500000) {
          console.log('⚠️ UNUSUAL DATA: Very high salary:', wizardData.essentialInfo.averageSalary)
        } else {
          console.log('✅ VALID DATA: Salary within reasonable range')
        }
      }

      if (wizardData.essentialInfo.plannedRetirementAge !== undefined) {
        console.log('🔄 plannedRetirementAge in state:', wizardData.essentialInfo.plannedRetirementAge, typeof wizardData.essentialInfo.plannedRetirementAge)

        // Only flag clearly invalid values
        if (wizardData.essentialInfo.plannedRetirementAge < 45) {
          console.log('⚠️ UNUSUAL DATA: Very low retirement age:', wizardData.essentialInfo.plannedRetirementAge)
        } else if (wizardData.essentialInfo.plannedRetirementAge > 75) {
          console.log('⚠️ UNUSUAL DATA: Very high retirement age:', wizardData.essentialInfo.plannedRetirementAge)
        } else {
          console.log('✅ VALID DATA: Retirement age within reasonable range')
        }
      }
    }
  }, [wizardData])

  // CRITICAL CORRUPTION TRACKING: Monitor userInputValues changes and detect exact moment of corruption
  useEffect(() => {
    console.log('🔄 userInputValues state changed:', userInputValues)

    // CRITICAL: Track the exact moment when averageSalary changes from 95000
    if (userInputValues?.averageSalary !== undefined) {
      console.log('🔄 userInputValues.averageSalary:', userInputValues.averageSalary, typeof userInputValues.averageSalary)

      // CRITICAL DETECTION: Flag the exact moment when 95000 becomes something else
      if (userInputValues.averageSalary !== 95000 && userInputValues.averageSalary > 94000 && userInputValues.averageSalary < 96000) {
        console.log('🚨🚨🚨 CORRUPTION MOMENT DETECTED: averageSalary changed from expected 95000 to:', userInputValues.averageSalary)
        console.log('🚨 This is the EXACT MOMENT the corruption occurred!')
        console.log('🚨 Previous value should have been 95000, now it is:', userInputValues.averageSalary)
        console.trace('🚨 CRITICAL STACK TRACE - This shows exactly what caused the corruption:')

        // Additional debugging
        console.log('🚨 Full userInputValues object:', userInputValues)
        console.log('🚨 Timestamp of corruption:', new Date().toISOString())
      }

      // CRITICAL DETECTION: Flag the exact moment when 28 becomes something else
      if (userInputValues.yearsOfService !== undefined && userInputValues.yearsOfService !== 28 && userInputValues.yearsOfService > 27 && userInputValues.yearsOfService < 29) {
        console.log('🚨🚨🚨 CORRUPTION MOMENT DETECTED: yearsOfService changed from expected 28 to:', userInputValues.yearsOfService)
        console.log('🚨 This is the EXACT MOMENT the yearsOfService corruption occurred!')
        console.log('🚨 Previous value should have been 28, now it is:', userInputValues.yearsOfService)
        console.trace('🚨 CRITICAL STACK TRACE - This shows exactly what caused the yearsOfService corruption:')

        // Additional debugging
        console.log('🚨 Full userInputValues object:', userInputValues)
        console.log('🚨 Timestamp of corruption:', new Date().toISOString())
      }

      // Standard validation for clearly invalid values
      if (userInputValues.averageSalary < 0) {
        console.log('🚨 INVALID USER INPUT: Negative salary:', userInputValues.averageSalary)
      } else if (userInputValues.averageSalary > 500000) {
        console.log('⚠️ UNUSUAL USER INPUT: Very high salary:', userInputValues.averageSalary)
      } else if (userInputValues.averageSalary === 95000) {
        console.log('✅ PERFECT: averageSalary is exactly 95000 as expected')
      } else {
        console.log('📊 INFO: averageSalary value:', userInputValues.averageSalary)
      }
    }

    if (userInputValues?.yearsOfService !== undefined) {
      console.log('🔄 userInputValues.yearsOfService:', userInputValues.yearsOfService, typeof userInputValues.yearsOfService)

      if (userInputValues.yearsOfService < 0) {
        console.log('🚨 INVALID USER INPUT: Negative years of service:', userInputValues.yearsOfService)
      } else if (userInputValues.yearsOfService > 50) {
        console.log('⚠️ UNUSUAL USER INPUT: Very high years of service:', userInputValues.yearsOfService)
      } else if (userInputValues.yearsOfService === 28) {
        console.log('✅ PERFECT: yearsOfService is exactly 28 as expected')
      } else {
        console.log('📊 INFO: yearsOfService value:', userInputValues.yearsOfService)
      }
    }

    if (userInputValues?.plannedRetirementAge !== undefined) {
      console.log('🔄 userInputValues.plannedRetirementAge:', userInputValues.plannedRetirementAge, typeof userInputValues.plannedRetirementAge)

      if (userInputValues.plannedRetirementAge < 45) {
        console.log('⚠️ UNUSUAL USER INPUT: Very low retirement age:', userInputValues.plannedRetirementAge)
      } else if (userInputValues.plannedRetirementAge > 75) {
        console.log('⚠️ UNUSUAL USER INPUT: Very high retirement age:', userInputValues.plannedRetirementAge)
      } else if (userInputValues.plannedRetirementAge === 52) {
        console.log('✅ PERFECT: plannedRetirementAge is exactly 52 as expected')
      } else {
        console.log('📊 INFO: plannedRetirementAge value:', userInputValues.plannedRetirementAge)
      }
    }
  }, [userInputValues])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDevMode, setIsDevMode] = useState(true)
  const [userModifiedFields, setUserModifiedFields] = useState<Set<string>>(new Set())
  
  // Calculate wizard progress
  const calculateProgress = (): WizardProgressV2 => {
    const dataQuality = assessDataQuality(wizardData.essentialInfo || {})
    
    return {
      stepNumber: currentStep + 1,
      totalSteps: 4,
      percentComplete: Math.round(((currentStep + 1) / 4) * 100),
      estimatedTimeRemaining: Math.max(0, (4 - currentStep - 1) * 2), // 2 min per step
      canGoBack: currentStep > 0,
      canGoForward: dataQuality.completeness >= 75, // Need 75% completeness to proceed
      canSave: dataQuality.completeness >= 50,
      dataQuality: {
        essential: dataQuality.completeness,
        optional: 0, // Will be calculated in later steps
        overall: dataQuality.completeness,
        confidence: dataQuality.confidence
      }
    }
  }
  
  const [progress, setProgress] = useState<WizardProgressV2>(calculateProgress())
  
  // Update progress when data changes
  useEffect(() => {
    setProgress(calculateProgress())
  }, [currentStep, wizardData])
  
  // Handle essential info data changes with complete state isolation
  const handleEssentialInfoChange = (newData: Partial<EssentialInfoData>, fieldName?: string) => {
    console.log('🔧 handleEssentialInfoChange called:', {
      newData,
      fieldName,
      currentUserModifiedFields: Array.from(userModifiedFields)
    })

    // CRITICAL DEBUG: Deep analysis of incoming data
    console.log('🔍 DEEP DATA ANALYSIS:')
    console.log('🔍 newData object keys:', Object.keys(newData))
    console.log('🔍 newData object values:', Object.values(newData))
    console.log('🔍 newData JSON:', JSON.stringify(newData))
    console.log('🔍 fieldName parameter:', fieldName)
    console.log('🔍 Current userInputValues before update:', userInputValues)
    console.log('🔍 Current wizardData.essentialInfo before update:', wizardData.essentialInfo)

    // CRITICAL DEBUG: Check if newData contains unexpected fields
    const expectedField = fieldName
    const actualFields = Object.keys(newData)
    const unexpectedFields = actualFields.filter(field => field !== expectedField)

    if (unexpectedFields.length > 0) {
      console.log('🚨 UNEXPECTED FIELDS DETECTED in newData!')
      console.log('🚨 Expected field:', expectedField)
      console.log('🚨 Actual fields:', actualFields)
      console.log('🚨 Unexpected fields:', unexpectedFields)
      console.trace('🚨 Stack trace of unexpected fields:')

      // Log details about each unexpected field
      unexpectedFields.forEach(field => {
        console.log(`🚨 Unexpected field "${field}" has value:`, newData[field as keyof EssentialInfoData])
      })
    }

    // INTELLIGENT VALIDATION: Distinguish between legitimate user input and system corruption
    console.log('🔍 VALIDATION: Incoming data analysis:', {
      newData,
      fieldName,
      isDirectUserInput: fieldName !== undefined,
      currentUserModifiedFields: Array.from(userModifiedFields)
    })

    // CRITICAL SAFETY: Only flag actual system corruption, not legitimate user input
    const protectedCoreFields = ['yearsOfService', 'averageSalary', 'plannedRetirementAge']
    protectedCoreFields.forEach(field => {
      if (newData[field as keyof EssentialInfoData] !== undefined && fieldName !== field) {
        console.log(`🚨 SYSTEM CORRUPTION DETECTED: Attempt to modify protected field ${field} via ${fieldName}!`)
        console.log(`🚨 Value being set: ${newData[field as keyof EssentialInfoData]}`)
        console.log('🚨 This indicates a calculation component is trying to override user input!')
        console.trace('🚨 Stack trace of system corruption attempt:')

        // Block the system corruption
        delete newData[field as keyof EssentialInfoData]
        console.log(`🚨 BLOCKED: Removed ${field} from newData to protect user input`)
      }
    })

    // VALIDATION: Check for reasonable input ranges (but allow user flexibility)
    if (newData.yearsOfService !== undefined) {
      if (newData.yearsOfService < 0) {
        console.log('⚠️ VALIDATION WARNING: Negative years of service not allowed:', newData.yearsOfService)
      } else if (newData.yearsOfService > 50) {
        console.log('⚠️ VALIDATION WARNING: Years of service seems high (>50):', newData.yearsOfService)
      } else if (fieldName === 'yearsOfService') {
        console.log('✅ USER INPUT: Valid years of service entered:', newData.yearsOfService)
      }
    }

    if (newData.averageSalary !== undefined) {
      if (newData.averageSalary < 0) {
        console.log('⚠️ VALIDATION WARNING: Negative salary not allowed:', newData.averageSalary)
      } else if (newData.averageSalary > 500000) {
        console.log('⚠️ VALIDATION WARNING: Salary seems very high (>$500k):', newData.averageSalary)
      } else if (fieldName === 'averageSalary') {
        console.log('✅ USER INPUT: Valid salary entered:', newData.averageSalary)
      }
    }

    if (newData.plannedRetirementAge !== undefined) {
      if (newData.plannedRetirementAge < 45) {
        console.log('⚠️ VALIDATION WARNING: Retirement age seems low (<45):', newData.plannedRetirementAge)
      } else if (newData.plannedRetirementAge > 75) {
        console.log('⚠️ VALIDATION WARNING: Retirement age seems high (>75):', newData.plannedRetirementAge)
      } else if (fieldName === 'plannedRetirementAge') {
        console.log('✅ USER INPUT: Valid retirement age entered:', newData.plannedRetirementAge)
      }
    }

    // STEP 1: Update pristine user input values (NEVER contaminated)
    console.log('🔄 STEP 1: Creating updatedUserInputValues...')
    console.log('🔄 Current userInputValues:', userInputValues)
    console.log('🔄 newData to merge:', newData)

    const updatedUserInputValues = { ...userInputValues, ...newData }
    console.log('🔄 Result after spread operation:', updatedUserInputValues)

    // CRITICAL DEBUG: Check if the spread operation introduced corruption
    if (fieldName === 'beneficiaryAge' && updatedUserInputValues.yearsOfService !== userInputValues?.yearsOfService) {
      console.log('🚨 CORRUPTION DETECTED IN SPREAD OPERATION!')
      console.log('🚨 Field being changed:', fieldName)
      console.log('🚨 Original yearsOfService:', userInputValues?.yearsOfService)
      console.log('🚨 New yearsOfService after spread:', updatedUserInputValues.yearsOfService)
      console.log('🚨 newData.yearsOfService:', newData.yearsOfService)
      console.trace('🚨 Stack trace of spread operation corruption:')
    }

    if (fieldName === 'beneficiaryAge' && updatedUserInputValues.averageSalary !== userInputValues?.averageSalary) {
      console.log('🚨 CORRUPTION DETECTED IN SPREAD OPERATION!')
      console.log('🚨 Field being changed:', fieldName)
      console.log('🚨 Original averageSalary:', userInputValues?.averageSalary)
      console.log('🚨 New averageSalary after spread:', updatedUserInputValues.averageSalary)
      console.log('🚨 newData.averageSalary:', newData.averageSalary)
      console.trace('🚨 Stack trace of spread operation corruption:')
    }

    setUserInputValues(updatedUserInputValues)
    console.log('✅ Updated userInputValues (pristine):', updatedUserInputValues)

    // STEP 2: Update wizardData.essentialInfo with ONLY user input (NO smart defaults)
    const pristineWizardData = { ...wizardData.essentialInfo, ...newData }
    setWizardData({
      ...wizardData,
      essentialInfo: pristineWizardData
    })
    console.log('✅ Updated wizardData.essentialInfo (pristine):', pristineWizardData)

    // STEP 3: Track user-modified fields
    const currentUserModifiedFields = new Set(userModifiedFields)
    if (fieldName) {
      currentUserModifiedFields.add(fieldName)
      setUserModifiedFields(currentUserModifiedFields)
      console.log('📝 Field marked as user-modified:', fieldName)
    }

    // STEP 4: Generate smart defaults separately (NEVER applied to wizardData.essentialInfo)
    // CRITICAL: Exclude protected fields from smart defaults generation
    const protectedFields = ['yearsOfService', 'averageSalary', 'plannedRetirementAge']
    const protectedUserModifiedFields = new Set([...currentUserModifiedFields, ...protectedFields])

    // CRITICAL FIX: Use isolated copy for smart defaults generation to prevent any modifications
    const isolatedDataForDefaults = JSON.parse(JSON.stringify(updatedUserInputValues))
    console.log('🧠 Isolated data for smart defaults generation:', isolatedDataForDefaults)

    const smartDefaults = generateSmartDefaults(isolatedDataForDefaults, protectedUserModifiedFields)
    setSmartDefaultsState(smartDefaults)
    console.log('🤖 Smart defaults generated (from isolated copy, protected fields excluded):', smartDefaults)

    // CRITICAL VERIFICATION: Ensure smart defaults generation didn't modify user input
    if (JSON.stringify(updatedUserInputValues) !== JSON.stringify(isolatedDataForDefaults)) {
      console.log('🚨 CRITICAL ERROR: Smart defaults generation modified user input!')
      console.log('🚨 Original:', updatedUserInputValues)
      console.log('🚨 Modified:', isolatedDataForDefaults)
      console.trace('🚨 Stack trace of smart defaults corruption:')
    } else {
      console.log('✅ VERIFIED: Smart defaults generation did not modify user input')
    }

    // CRITICAL DEBUG: Verify smart defaults don't contain protected fields
    protectedFields.forEach(field => {
      if (smartDefaults[field as keyof EssentialInfoData] !== undefined) {
        console.log('🚨 CRITICAL ERROR: Smart defaults contains protected field:', field, '=', smartDefaults[field as keyof EssentialInfoData])
        console.trace('🚨 Stack trace of protected field contamination:')
      }
    })

    // STEP 5: Create COMPLETELY ISOLATED calculation data (NEVER modify user input)
    // FORCE RECOMPILATION: 2025-06-23 - Corruption fixes implemented
    console.log('🔒 CREATING ISOLATED CALCULATION DATA...')
    console.log('🔒 Original updatedUserInputValues:', updatedUserInputValues)

    // CRITICAL FIX: Use JSON.parse(JSON.stringify()) for deep copy to prevent any reference sharing
    const isolatedUserData = JSON.parse(JSON.stringify(updatedUserInputValues))
    console.log('🔒 Deep copied user data:', isolatedUserData)

    // CRITICAL FIX: Create calculation data from isolated copy, never from original
    const combinedCalculationData = { ...isolatedUserData }
    console.log('🔒 Initial calculation data (from isolated copy):', combinedCalculationData)

    // Apply smart defaults only to the ISOLATED calculation data, never to user input
    Object.keys(smartDefaults).forEach(key => {
      const isProtectedField = protectedFields.includes(key)
      if (!currentUserModifiedFields.has(key) && !isProtectedField && smartDefaults[key as keyof EssentialInfoData] !== undefined) {
        // CRITICAL: Only modify the isolated calculation data, never the user input
        combinedCalculationData[key as keyof EssentialInfoData] = smartDefaults[key as keyof EssentialInfoData]
        console.log(`✅ Applied smart default to ISOLATED calculation data: ${key}:`, smartDefaults[key as keyof EssentialInfoData])
      } else if (isProtectedField) {
        console.log(`🛡️ Skipped smart default for protected field: ${key}`)
      }
    })

    // CRITICAL VERIFICATION: Ensure user input values are NEVER modified
    console.log('🔍 CRITICAL VERIFICATION:')
    console.log('🔍 Original updatedUserInputValues after calculation:', updatedUserInputValues)
    console.log('🔍 Isolated combinedCalculationData:', combinedCalculationData)

    // Verify that user input values remain pristine
    if (JSON.stringify(updatedUserInputValues) !== JSON.stringify(isolatedUserData)) {
      console.log('🚨 CRITICAL ERROR: User input values were modified during calculation data generation!')
      console.log('🚨 This should NEVER happen!')
      console.trace('🚨 Stack trace of user input modification:')
    } else {
      console.log('✅ VERIFIED: User input values remain pristine and unmodified')
    }

    // Set the isolated calculation data (completely separate from user input)
    setCalculationData(combinedCalculationData)
    console.log('📊 ISOLATED calculation data set (completely separate from user input):', combinedCalculationData)

    // Clear related errors
    const newErrors = { ...errors }
    Object.keys(newData).forEach(key => {
      delete newErrors[key]
    })
    setErrors(newErrors)
  }

  // Note: handlePreviewChange removed - now using handleEssentialInfoChange for all changes
  // This ensures consistent user input tracking across all components
  
  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 0) {
      // CRITICAL FIX: Use pristine userInputValues for validation
      const data = userInputValues || {}
      
      if (!data.birthYear) {
        newErrors['birthYear'] = 'Birth year is required'
      } else if (data.birthYear < 1940 || data.birthYear > 2010) {
        newErrors['birthYear'] = 'Please enter a valid birth year'
      }
      
      if (!data.retirementGroup) {
        newErrors['retirementGroup'] = 'Job category is required'
      }
      
      if (!data.yearsOfService) {
        newErrors['yearsOfService'] = 'Years of service is required'
      } else if (data.yearsOfService <= 0) {
        newErrors['yearsOfService'] = 'Years of service must be positive'
      }
      
      if (!data.averageSalary) {
        newErrors['averageSalary'] = 'Average salary is required'
      } else if (data.averageSalary <= 0) {
        newErrors['averageSalary'] = 'Average salary must be positive'
      }
      
      // Validate retirement age if provided
      if (data.plannedRetirementAge && data.retirementGroup && data.yearsOfService && data.serviceEntry) {
        const validation = validateRetirementAge(
          data.plannedRetirementAge,
          data.retirementGroup,
          data.yearsOfService,
          data.serviceEntry
        )
        if (!validation.isValid) {
          newErrors['plannedRetirementAge'] = validation.message || 'Invalid retirement age'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle step navigation
  const handleStepChange = (newStep: number) => {
    if (newStep > currentStep && !validateCurrentStep()) {
      return // Don't proceed if validation fails
    }
    
    setCurrentStep(Math.max(0, Math.min(3, newStep)))
  }
  
  // Handle save
  const handleSave = () => {
    console.log('Saving wizard data:', wizardData)
    // In real implementation, this would save to backend/localStorage
  }
  
  // Handle skip to results
  const handleSkipToResults = () => {
    if (validateCurrentStep()) {
      setCurrentStep(3)
    }
  }
  
  // Check if can skip to results (minimum data available)
  const canSkipToResults = () => {
    const data = wizardData.essentialInfo || {}
    return !!(data.retirementGroup && data.yearsOfService && data.averageSalary)
  }
  
  // Development controls
  const loadTestData = () => {
    const currentYear = new Date().getFullYear()
    const birthYear = currentYear - 55 // Calculate birth year for age 55

    const testData = {
      birthYear: birthYear,
      currentAge: 55,
      retirementGroup: '2' as const,
      yearsOfService: 28,           // ✅ Test 2 expects: 28
      averageSalary: 95000,         // ✅ Test 3 expects: 95000
      plannedRetirementAge: 52,     // ✅ Test 1 expects: 52 (changed from 55)
      serviceEntry: 'before_2012' as const,
      retirementOption: 'C' as const,
      beneficiaryAge: 55
    }

    console.log('🧪 LOADING TEST DATA:')
    console.log('🧪 Original testData object:', testData)
    console.log('🧪 yearsOfService:', testData.yearsOfService, typeof testData.yearsOfService)
    console.log('🧪 averageSalary:', testData.averageSalary, typeof testData.averageSalary)

    // CRITICAL DEBUG: Verify testData integrity before state updates
    console.log('🔍 PRE-STATE-UPDATE VERIFICATION:')
    console.log('🔍 testData.yearsOfService === 28:', testData.yearsOfService === 28)
    console.log('🔍 testData.averageSalary === 95000:', testData.averageSalary === 95000)
    console.log('🔍 JSON.stringify(testData):', JSON.stringify(testData))

    // CRITICAL: Use Object.freeze to prevent any mutations
    const frozenTestData = Object.freeze({ ...testData })
    console.log('🔒 Frozen testData created:', frozenTestData)

    // CRITICAL FIX: Update all three states with clean test data
    console.log('🔄 Setting userInputValues...')
    setUserInputValues(frozenTestData)

    console.log('🔄 Setting wizardData...')
    setWizardData({
      essentialInfo: frozenTestData
    })

    console.log('🔄 Clearing smart defaults...')
    setSmartDefaultsState({}) // Clear smart defaults

    console.log('🔄 Setting calculationData...')
    setCalculationData(frozenTestData) // Set calculation data to test data initially

    // Clear user modified fields when loading test data
    console.log('🔄 Clearing user modified fields...')
    setUserModifiedFields(new Set())

    console.log('🧪 Test data loaded, all states updated')
    console.log('🧪 userInputValues set to:', frozenTestData)
    console.log('🧪 wizardData.essentialInfo set to:', frozenTestData)
    console.log('🧪 calculationData set to:', frozenTestData)

    // CRITICAL: Add a global corruption detector that monitors ALL state changes
    console.log('🔍 ACTIVATING GLOBAL CORRUPTION DETECTOR...')

    // Monitor for any changes to the critical values
    const originalValues = {
      averageSalary: 95000,
      yearsOfService: 28,
      plannedRetirementAge: 52
    }

    // Set up a monitoring interval to catch corruption as it happens
    const corruptionDetector = setInterval(() => {
      const currentUser = userInputValuesRef.current
      const currentWizard = wizardDataRef.current?.essentialInfo

      // Check for corruption in userInputValues
      if (currentUser?.averageSalary && currentUser.averageSalary !== originalValues.averageSalary) {
        console.log('🚨🚨🚨 LIVE CORRUPTION DETECTED: userInputValues.averageSalary changed!')
        console.log('🚨 Original:', originalValues.averageSalary)
        console.log('🚨 Current:', currentUser.averageSalary)
        console.log('🚨 Timestamp:', new Date().toISOString())
        console.trace('🚨 Stack trace at moment of detection:')
        clearInterval(corruptionDetector) // Stop monitoring after first detection
      }

      if (currentUser?.yearsOfService && currentUser.yearsOfService !== originalValues.yearsOfService) {
        console.log('🚨🚨🚨 LIVE CORRUPTION DETECTED: userInputValues.yearsOfService changed!')
        console.log('🚨 Original:', originalValues.yearsOfService)
        console.log('🚨 Current:', currentUser.yearsOfService)
        console.log('🚨 Timestamp:', new Date().toISOString())
        console.trace('🚨 Stack trace at moment of detection:')
        clearInterval(corruptionDetector) // Stop monitoring after first detection
      }

      // Check for corruption in wizardData
      if (currentWizard?.averageSalary && currentWizard.averageSalary !== originalValues.averageSalary) {
        console.log('🚨🚨🚨 LIVE CORRUPTION DETECTED: wizardData.essentialInfo.averageSalary changed!')
        console.log('🚨 Original:', originalValues.averageSalary)
        console.log('🚨 Current:', currentWizard.averageSalary)
        console.log('🚨 Timestamp:', new Date().toISOString())
        console.trace('🚨 Stack trace at moment of detection:')
        clearInterval(corruptionDetector) // Stop monitoring after first detection
      }

      if (currentWizard?.yearsOfService && currentWizard.yearsOfService !== originalValues.yearsOfService) {
        console.log('🚨🚨🚨 LIVE CORRUPTION DETECTED: wizardData.essentialInfo.yearsOfService changed!')
        console.log('🚨 Original:', originalValues.yearsOfService)
        console.log('🚨 Current:', currentWizard.yearsOfService)
        console.log('🚨 Timestamp:', new Date().toISOString())
        console.trace('🚨 Stack trace at moment of detection:')
        clearInterval(corruptionDetector) // Stop monitoring after first detection
      }
    }, 10) // Check every 10ms for corruption

    // Stop monitoring after 30 seconds
    setTimeout(() => {
      clearInterval(corruptionDetector)
      console.log('🔍 Global corruption detector stopped after 30 seconds')
    }, 30000)

    // CRITICAL FIX: Use React's state update callback to verify state immediately after setting
    setUserInputValues(prev => {
      console.log('🧪 IMMEDIATE VERIFICATION: userInputValues state update callback')
      console.log('🧪 Previous userInputValues:', prev)
      console.log('🧪 New userInputValues:', frozenTestData)
      return frozenTestData
    })

    setWizardData(prev => {
      console.log('🧪 IMMEDIATE VERIFICATION: wizardData state update callback')
      console.log('🧪 Previous wizardData:', prev)
      console.log('🧪 New wizardData essentialInfo:', frozenTestData)
      return { essentialInfo: frozenTestData }
    })

    // CRITICAL FIX: Use a verification function that doesn't rely on closure
    const verifyStateAfterLoad = () => {
      // Multiple verification points to catch timing issues
      const verifyAtTime = (delay: number, label: string) => {
        setTimeout(() => {
          console.log(`🧪 VERIFICATION ${label} (${delay}ms):`)

          // Use refs to get current state values (avoiding closure issues)
          const currentUserInputValues = userInputValuesRef.current
          const currentWizardData = wizardDataRef.current

          console.log('🧪 Current State Values (via refs):')
          console.log('🧪 userInputValues.yearsOfService:', currentUserInputValues?.yearsOfService)
          console.log('🧪 userInputValues.averageSalary:', currentUserInputValues?.averageSalary)
          console.log('🧪 wizardData.essentialInfo.yearsOfService:', currentWizardData.essentialInfo?.yearsOfService)
          console.log('🧪 wizardData.essentialInfo.averageSalary:', currentWizardData.essentialInfo?.averageSalary)

          // Access the DOM to verify the input field values
          const salaryInput = document.getElementById('averageSalary') as HTMLInputElement
          const yearsInput = document.getElementById('yearsOfService') as HTMLInputElement
          const ageInput = document.getElementById('plannedRetirementAge') as HTMLInputElement

          console.log('🧪 DOM Input Field Values:')
          console.log('🧪 Salary input value:', salaryInput?.value)
          console.log('🧪 Years input value:', yearsInput?.value)
          console.log('🧪 Age input value:', ageInput?.value)

          // INTELLIGENT VALIDATION: Check for data integrity without false positives
          console.log('📊 STATE INTEGRITY CHECK:')
          console.log('  userInputValues.yearsOfService:', currentUserInputValues?.yearsOfService)
          console.log('  userInputValues.averageSalary:', currentUserInputValues?.averageSalary)
          console.log('  wizardData.essentialInfo.yearsOfService:', currentWizardData.essentialInfo?.yearsOfService)
          console.log('  wizardData.essentialInfo.averageSalary:', currentWizardData.essentialInfo?.averageSalary)

          // Only flag clearly invalid values
          if (currentUserInputValues?.yearsOfService !== undefined && currentUserInputValues.yearsOfService < 0) {
            console.log('🚨 INVALID STATE: Negative years of service in userInputValues:', currentUserInputValues.yearsOfService)
          }
          if (currentUserInputValues?.averageSalary !== undefined && currentUserInputValues.averageSalary < 0) {
            console.log('🚨 INVALID STATE: Negative salary in userInputValues:', currentUserInputValues.averageSalary)
          }
          if (currentWizardData.essentialInfo?.yearsOfService !== undefined && currentWizardData.essentialInfo.yearsOfService < 0) {
            console.log('🚨 INVALID STATE: Negative years of service in wizardData:', currentWizardData.essentialInfo.yearsOfService)
          }
          if (currentWizardData.essentialInfo?.averageSalary !== undefined && currentWizardData.essentialInfo.averageSalary < 0) {
            console.log('🚨 INVALID STATE: Negative salary in wizardData:', currentWizardData.essentialInfo.averageSalary)
          }

          // Check DOM values for basic integrity
          console.log('📊 DOM INTEGRITY CHECK:')
          console.log('  Salary input value:', salaryInput?.value)
          console.log('  Years input value:', yearsInput?.value)
          console.log('  Age input value:', ageInput?.value)

          // Only flag clearly problematic DOM values
          if (salaryInput?.value && parseFloat(salaryInput.value) < 0) {
            console.log('🚨 INVALID DOM: Negative salary in input field:', salaryInput.value)
          }
          if (yearsInput?.value && parseFloat(yearsInput.value) < 0) {
            console.log('🚨 INVALID DOM: Negative years in input field:', yearsInput.value)
          }
          if (ageInput?.value && parseFloat(ageInput.value) < 0) {
            console.log('🚨 INVALID DOM: Negative age in input field:', ageInput.value)
          }

          console.log(`🧪 ${label} verification complete`)
        }, delay)
      }

      verifyAtTime(10, 'IMMEDIATE')
      verifyAtTime(50, 'FAST')
      verifyAtTime(100, 'NORMAL')
      verifyAtTime(500, 'DELAYED')
    }

    verifyStateAfterLoad()
  }

  // Test specific scenarios mentioned by user
  const testScenario1 = () => {
    console.log('🧪 Testing Scenario 1: Enter 52 in retirement age')
    const ageInput = document.getElementById('plannedRetirementAge') as HTMLInputElement
    console.log('🧪 Before - DOM Age Input:', ageInput?.value)

    handleEssentialInfoChange({ plannedRetirementAge: 52 }, 'plannedRetirementAge')

    setTimeout(() => {
      const ageInputAfter = document.getElementById('plannedRetirementAge') as HTMLInputElement
      console.log('🧪 After - DOM Age Input:', ageInputAfter?.value)
      console.log('🧪 Result:', ageInputAfter?.value === '52' ? '✅ PASS' : '❌ FAIL')
    }, 100)
  }

  const testScenario2 = () => {
    console.log('🧪 Testing Scenario 2: Enter 28 in years of service')
    const yearsInput = document.getElementById('yearsOfService') as HTMLInputElement
    console.log('🧪 Before - DOM Years Input:', yearsInput?.value)

    handleEssentialInfoChange({ yearsOfService: 28 }, 'yearsOfService')

    setTimeout(() => {
      const yearsInputAfter = document.getElementById('yearsOfService') as HTMLInputElement
      console.log('🧪 After - DOM Years Input:', yearsInputAfter?.value)
      console.log('🧪 Result:', yearsInputAfter?.value === '28' ? '✅ PASS' : '❌ FAIL')
    }, 100)
  }

  const testScenario3 = () => {
    console.log('🧪 Testing Scenario 3: Enter 95000 in average salary')
    const salaryInput = document.getElementById('averageSalary') as HTMLInputElement
    console.log('🧪 Before - DOM Salary Input:', salaryInput?.value)

    handleEssentialInfoChange({ averageSalary: 95000 }, 'averageSalary')

    setTimeout(() => {
      const salaryInputAfter = document.getElementById('averageSalary') as HTMLInputElement
      console.log('🧪 After - DOM Salary Input:', salaryInputAfter?.value)
      console.log('🧪 Result:', salaryInputAfter?.value === '95000' ? '✅ PASS' : '❌ FAIL')
    }, 100)
  }

  // Local parseNumberInput function for testing (mirrors the one in essential-information-step)
  const testParseNumberInput = (value: string, isInteger: boolean = false): number => {
    if (!value || value.trim() === '') return 0
    const parsed = isInteger ? parseInt(value, 10) : parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  // Test salary input parsing specifically
  const testSalaryParsing = () => {
    console.log('🧪 COMPREHENSIVE INPUT CORRUPTION TEST:')
    console.log('=======================================')

    // Test different parsing methods
    const testValue = '95000'
    console.log('Input value:', testValue)
    console.log('parseInt(testValue, 10):', parseInt(testValue, 10))
    console.log('parseFloat(testValue):', parseFloat(testValue))
    console.log('Number(testValue):', Number(testValue))
    console.log('+testValue:', +testValue)

    // Test the local parseNumberInput function
    console.log('testParseNumberInput(testValue, true) [parseInt]:', testParseNumberInput(testValue, true))
    console.log('testParseNumberInput(testValue, false) [parseFloat]:', testParseNumberInput(testValue, false))

    // Test edge cases
    console.log('\n🧪 Edge Case Testing:')
    const edgeCases = ['95000', '95000.0', '95000.5', '94999', '95001', '28', '28.0', '27.9', '27.8']
    edgeCases.forEach(value => {
      console.log(`Value "${value}":`)
      console.log(`  parseInt: ${parseInt(value, 10)}`)
      console.log(`  parseFloat: ${parseFloat(value)}`)
      console.log(`  testParseNumberInput(true): ${testParseNumberInput(value, true)}`)
      console.log(`  testParseNumberInput(false): ${testParseNumberInput(value, false)}`)
    })

    // Test direct state update
    console.log('\n🧪 Testing direct state update with 95000...')
    handleEssentialInfoChange({ averageSalary: 95000 }, 'averageSalary')

    setTimeout(() => {
      console.log('Result after direct update:')
      const salaryInput = document.getElementById('averageSalary') as HTMLInputElement
      console.log('  DOM Salary Input:', salaryInput?.value)
      console.log('  Success:', salaryInput?.value === '95000' ? '✅' : '❌')

      // Additional verification
      if (salaryInput?.value !== '95000') {
        console.log('🚨 DOM corruption detected:', salaryInput?.value)
      }
    }, 100)

    // CRITICAL TEST: Simulate HTML input field behavior
    console.log('\n🧪 SIMULATING HTML INPUT FIELD BEHAVIOR:')
    console.log('=========================================')

    // Test what happens when we programmatically set input field values
    setTimeout(() => {
      const salaryInput = document.getElementById('averageSalary') as HTMLInputElement
      const yearsInput = document.getElementById('yearsOfService') as HTMLInputElement

      if (salaryInput) {
        console.log('🔍 Current salary input value:', salaryInput.value)
        console.log('🔍 Setting salary input to "95000"...')
        salaryInput.value = '95000'
        console.log('🔍 Salary input value after setting:', salaryInput.value)

        // Trigger change event manually
        const changeEvent = new Event('change', { bubbles: true })
        salaryInput.dispatchEvent(changeEvent)
        console.log('🔍 Dispatched change event for salary input')
      }

      if (yearsInput) {
        console.log('🔍 Current years input value:', yearsInput.value)
        console.log('🔍 Setting years input to "28"...')
        yearsInput.value = '28'
        console.log('🔍 Years input value after setting:', yearsInput.value)

        // Trigger change event manually
        const changeEvent = new Event('change', { bubbles: true })
        yearsInput.dispatchEvent(changeEvent)
        console.log('🔍 Dispatched change event for years input')
      }
    }, 200)
  }

  // Test all scenarios at once with state isolation verification
  const testAllScenarios = () => {
    console.log('🧪 COMPREHENSIVE STATE ISOLATION TEST')
    console.log('🧪 This test verifies complete state isolation and corruption prevention')
    console.log('🧪 Expected: All values remain exactly as entered in both states')

    clearData()
    setTimeout(() => {
      // Set up basic data first
      console.log('🧪 Step 1: Setting up basic data...')
      handleEssentialInfoChange({
        birthYear: 1970,
        retirementGroup: '4'
      })

      setTimeout(() => {
        // Test the specific values that were problematic
        console.log('🧪 Step 2: Setting test values (52, 28, 95000)...')
        handleEssentialInfoChange({
          plannedRetirementAge: 52,
          yearsOfService: 28,
          averageSalary: 95000
        })

        // Immediate verification
        setTimeout(() => {
          console.log('🧪 Step 3: Immediate verification (50ms):')
          const userAge = userInputValues?.plannedRetirementAge
          const wizardAge = wizardData.essentialInfo?.plannedRetirementAge
          const userYears = userInputValues?.yearsOfService
          const wizardYears = wizardData.essentialInfo?.yearsOfService
          const userSalary = userInputValues?.averageSalary
          const wizardSalary = wizardData.essentialInfo?.averageSalary

          console.log(`  - Retirement Age: User=${userAge}, Wizard=${wizardAge}`)
          console.log(`  - Years of Service: User=${userYears}, Wizard=${wizardYears}`)
          console.log(`  - Average Salary: User=${userSalary}, Wizard=${wizardSalary}`)
        }, 50)

        // Final verification after all processing
        setTimeout(() => {
          console.log('🧪 Step 4: Final verification (300ms):')

          // Check both states for each value
          const ageUserCorrect = userInputValues?.plannedRetirementAge === 52
          const ageWizardCorrect = wizardData.essentialInfo?.plannedRetirementAge === 52
          const yearsUserCorrect = userInputValues?.yearsOfService === 28
          const yearsWizardCorrect = wizardData.essentialInfo?.yearsOfService === 28
          const salaryUserCorrect = userInputValues?.averageSalary === 95000
          const salaryWizardCorrect = wizardData.essentialInfo?.averageSalary === 95000

          console.log('🧪 FINAL STATE ISOLATION VERIFICATION:')
          console.log(`  📊 Retirement Age (52): User=${ageUserCorrect ? '✅' : '❌'}, Wizard=${ageWizardCorrect ? '✅' : '❌'}`)
          console.log(`  📊 Years of Service (28): User=${yearsUserCorrect ? '✅' : '❌'}, Wizard=${yearsWizardCorrect ? '✅' : '❌'}`)
          console.log(`  📊 Average Salary (95000): User=${salaryUserCorrect ? '✅' : '❌'}, Wizard=${salaryWizardCorrect ? '✅' : '❌'}`)

          const allTestsPass = ageUserCorrect && ageWizardCorrect && yearsUserCorrect && yearsWizardCorrect && salaryUserCorrect && salaryWizardCorrect
          console.log(`  🎯 OVERALL RESULT: ${allTestsPass ? '✅ ALL TESTS PASS - STATE ISOLATION WORKING' : '❌ SOME TESTS FAILED - STATE CORRUPTION DETECTED'}`)

          // Additional state verification
          console.log('🧪 Step 5: State isolation verification:')
          console.log(`  - Smart Defaults State: ${Object.keys(smartDefaultsState).length} fields`)
          console.log(`  - Calculation Data: ${Object.keys(calculationData).length} fields`)
          console.log(`  - States are properly isolated: ${allTestsPass ? '✅' : '❌'}`)
        }, 300)
      }, 100)
    }, 100)
  }
  
  const clearData = () => {
    // CRITICAL FIX: Clear all three states
    setUserInputValues({})
    setWizardData({ essentialInfo: {} })
    setSmartDefaultsState({})
    setCalculationData({})
    setErrors({})
    setUserModifiedFields(new Set())
    console.log('🧪 All data cleared including all three states')
  }

  // Comprehensive state verification function
  const verifyStateIsolation = () => {
    console.log('🔍 COMPREHENSIVE STATE VERIFICATION:')
    console.log('=====================================')

    // Check if both user states match
    const userAge = userInputValues?.plannedRetirementAge
    const wizardAge = wizardData.essentialInfo?.plannedRetirementAge
    const userYears = userInputValues?.yearsOfService
    const wizardYears = wizardData.essentialInfo?.yearsOfService
    const userSalary = userInputValues?.averageSalary
    const wizardSalary = wizardData.essentialInfo?.averageSalary

    console.log('📊 State Comparison:')
    console.log(`  Retirement Age: User=${userAge}, Wizard=${wizardAge}, Match=${userAge === wizardAge ? '✅' : '❌'}`)
    console.log(`  Years of Service: User=${userYears}, Wizard=${wizardYears}, Match=${userYears === wizardYears ? '✅' : '❌'}`)
    console.log(`  Average Salary: User=${userSalary}, Wizard=${wizardSalary}, Match=${userSalary === wizardSalary ? '✅' : '❌'}`)

    console.log('📊 Test Scenario Results:')
    console.log(`  Test 1 (Age=52): User=${userAge === 52 ? '✅' : '❌'}, Wizard=${wizardAge === 52 ? '✅' : '❌'}`)
    console.log(`  Test 2 (Years=28): User=${userYears === 28 ? '✅' : '❌'}, Wizard=${wizardYears === 28 ? '✅' : '❌'}`)
    console.log(`  Test 3 (Salary=95000): User=${userSalary === 95000 ? '✅' : '❌'}, Wizard=${wizardSalary === 95000 ? '✅' : '❌'}`)

    console.log('📊 State Isolation Status:')
    console.log(`  Smart Defaults Fields: ${Object.keys(smartDefaultsState).length}`)
    console.log(`  Calculation Data Fields: ${Object.keys(calculationData).length}`)
    console.log(`  User Modified Fields: ${userModifiedFields.size}`)

    const allMatch = userAge === wizardAge && userYears === wizardYears && userSalary === wizardSalary
    const allTestsPass = userAge === 52 && wizardAge === 52 && userYears === 28 && wizardYears === 28 && userSalary === 95000 && wizardSalary === 95000

    console.log(`🎯 OVERALL STATUS: ${allMatch && allTestsPass ? '✅ PERFECT STATE ISOLATION' : '❌ STATE ISSUES DETECTED'}`)

    return { allMatch, allTestsPass }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Development Header */}
      {isDevMode && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <TestTube className="h-5 w-5" />
              Phase 1 Development Mode
              <Badge variant="outline">v2.0 - 4-Step Wizard</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={loadTestData} variant="outline">
                  Load Test Data
                </Button>
                <Button size="sm" onClick={clearData} variant="outline">
                  Clear Data
                </Button>
                <Button size="sm" onClick={() => setIsDevMode(false)} variant="ghost">
                  <Eye className="h-4 w-4 mr-2" />
                  Hide Dev Controls
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Test Scenarios:</span>
                  <Button size="sm" onClick={testScenario1} variant="outline" className="text-xs">
                    Test: 52 Age
                  </Button>
                  <Button size="sm" onClick={testScenario2} variant="outline" className="text-xs">
                    Test: 28 Years
                  </Button>
                  <Button size="sm" onClick={testScenario3} variant="outline" className="text-xs">
                    Test: 95000 Salary
                  </Button>
                  <Button size="sm" onClick={testSalaryParsing} variant="outline" className="text-xs bg-orange-50">
                    🔍 Debug Salary
                  </Button>
                  <Button size="sm" onClick={() => {
                    console.log('🧪 IMMEDIATE STATE CHECK:')
                    console.log('userInputValues:', userInputValues)
                    console.log('wizardData.essentialInfo:', wizardData.essentialInfo)
                    console.log('calculationData:', calculationData)
                    console.log('smartDefaultsState:', smartDefaultsState)
                  }} variant="outline" className="text-xs bg-purple-50">
                    📊 Check States
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" onClick={testAllScenarios} variant="default" className="text-xs">
                    🧪 Test All Scenarios
                  </Button>
                  <Button size="sm" onClick={verifyStateIsolation} variant="outline" className="text-xs">
                    🔍 Verify States
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Check console for detailed results
                  </span>
                </div>
              </div>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Version:</strong> This is the new 4-step wizard consolidating the original 7 steps. 
                Currently testing Step 1 (Essential Information) with smart defaults and live preview.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
      
      {/* Wizard Navigation */}
      <WizardNavigationV2
        currentStep={currentStep}
        progress={progress}
        onStepChange={handleStepChange}
        onSave={handleSave}
        onSkipToResults={handleSkipToResults}
        canSkipToResults={canSkipToResults()}
      />
      
      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <>
            <EssentialInformationStep
              data={userInputValues || {}}
              onChange={handleEssentialInfoChange}
              errors={errors}
            />
            
            {/* Enhanced Calculation Preview */}
            <EnhancedCalculationPreview
              data={calculationData || {}}
              onChange={(newData, fieldName) => {
                console.log('🎯 EnhancedCalculationPreview onChange intercepted:')
                console.log('🎯 newData from component:', newData)
                console.log('🎯 fieldName from component:', fieldName)
                console.log('🎯 calculationData being passed to component:', calculationData)

                // CRITICAL DEBUG: Check if calculationData contains corrupted values
                if (calculationData?.yearsOfService && calculationData.yearsOfService !== Math.floor(calculationData.yearsOfService)) {
                  console.log('🚨 WARNING: calculationData contains non-integer yearsOfService:', calculationData.yearsOfService)
                  console.log('🚨 This could be the source of corruption!')
                }

                if (calculationData?.averageSalary && calculationData.averageSalary !== Math.floor(calculationData.averageSalary)) {
                  console.log('🚨 WARNING: calculationData contains non-integer averageSalary:', calculationData.averageSalary)
                  console.log('🚨 This could be the source of corruption!')
                }

                // Call the original handler
                handleEssentialInfoChange(newData, fieldName)
              }}
            />
          </>
        )}
        
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Benefits & Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Coming in Phase 1 - Social Security and additional income step
              </p>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Goals & Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Coming in Phase 1 - Goals and optimization preferences step
              </p>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Results & Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Coming in Phase 1 - Enhanced results presentation with action plan
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Test Helper */}
      {isDevMode && (
        <WizardTestHelper />
      )}

      {/* Development Data Inspector */}
      {isDevMode && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Settings className="h-5 w-5" />
              Data Inspector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. User Input Values (PRISTINE - Form Display):</h4>
                <pre className="text-xs bg-green-50 p-3 rounded border border-green-200 overflow-auto max-h-32">
                  {JSON.stringify(userInputValues, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. WizardData.essentialInfo (PRISTINE - Should Match #1):</h4>
                <pre className="text-xs bg-blue-50 p-3 rounded border border-blue-200 overflow-auto max-h-32">
                  {JSON.stringify(wizardData.essentialInfo, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Smart Defaults (SEPARATE - Never Mixed):</h4>
                <pre className="text-xs bg-yellow-50 p-3 rounded border border-yellow-200 overflow-auto max-h-32">
                  {JSON.stringify(smartDefaultsState, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">4. Calculation Data (COMBINED - For Calculations Only):</h4>
                <pre className="text-xs bg-purple-50 p-3 rounded border border-purple-200 overflow-auto max-h-32">
                  {JSON.stringify(calculationData, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Progress & Validation:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Step:</span> {progress.stepNumber}/4
                  </div>
                  <div>
                    <span className="font-medium">Completeness:</span> {progress.dataQuality.essential}%
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span> {progress.dataQuality.confidence}%
                  </div>
                  <div>
                    <span className="font-medium">Can Proceed:</span> {progress.canGoForward ? '✅' : '❌'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">User Modified Fields:</h4>
                <pre className="text-xs bg-white p-3 rounded border">
                  {JSON.stringify(Array.from(userModifiedFields), null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Debug Test Results (Both States Must Match):</h4>
                <div className="text-xs bg-white p-3 rounded border space-y-2">
                  <div>
                    <strong>Test 1 - Retirement Age 52:</strong>
                    <div className="ml-4 space-y-1">
                      <div>UserInput: {userInputValues?.plannedRetirementAge || 'Not set'} {userInputValues?.plannedRetirementAge === 52 ? ' ✅' : ' ❌'}</div>
                      <div>WizardData: {wizardData.essentialInfo?.plannedRetirementAge || 'Not set'} {wizardData.essentialInfo?.plannedRetirementAge === 52 ? ' ✅' : ' ❌'}</div>
                    </div>
                  </div>
                  <div>
                    <strong>Test 2 - Years of Service 28:</strong>
                    <div className="ml-4 space-y-1">
                      <div>UserInput: {userInputValues?.yearsOfService || 'Not set'} {userInputValues?.yearsOfService === 28 ? ' ✅' : ' ❌'}</div>
                      <div>WizardData: {wizardData.essentialInfo?.yearsOfService || 'Not set'} {wizardData.essentialInfo?.yearsOfService === 28 ? ' ✅' : ' ❌'}</div>
                    </div>
                  </div>
                  <div>
                    <strong>Test 3 - Average Salary 95000:</strong>
                    <div className="ml-4 space-y-1">
                      <div>UserInput: {userInputValues?.averageSalary || 'Not set'} {userInputValues?.averageSalary === 95000 ? ' ✅' : ' ❌'}</div>
                      <div>WizardData: {wizardData.essentialInfo?.averageSalary || 'Not set'} {wizardData.essentialInfo?.averageSalary === 95000 ? ' ✅' : ' ❌'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {Object.keys(errors).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Validation Errors:</h4>
                  <pre className="text-xs bg-red-50 p-3 rounded border text-red-700">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
