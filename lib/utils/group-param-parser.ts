/**
 * Utility functions for parsing and normalizing retirement group query parameters
 * Used by the pension calculator to pre-select groups from URL parameters
 */

export type RetirementGroup = 'GROUP_1' | 'GROUP_2' | 'GROUP_3' | 'GROUP_4'

export interface GroupParamResult {
  success: boolean
  group: RetirementGroup | null
  defaultAge: number | null
  error?: string
}

/**
 * Default retirement ages by group based on MSRB minimum eligibility
 */
export const GROUP_DEFAULT_AGES: Record<RetirementGroup, number> = {
  GROUP_1: 60, // General employees - minimum age 60
  GROUP_2: 55, // Probation/Court officers - minimum age 55
  GROUP_3: 45, // MA State Police ONLY - ANY age with 20+ years (practical default 45 for early career starters)
  GROUP_4: 50, // Municipal Police/Fire/Corrections - minimum age 50
}

/**
 * Parses a group query parameter and normalizes it to internal format
 * Handles various input formats: "1", "GROUP_1", "Group 1", "group-1", etc.
 * 
 * @param groupParam - The raw query parameter value
 * @returns GroupParamResult with normalized group or error
 */
export function parseGroupParam(groupParam: string | null): GroupParamResult {
  if (!groupParam || groupParam.trim() === '') {
    return {
      success: false,
      group: null,
      defaultAge: null,
      error: 'No group parameter provided'
    }
  }

  const trimmed = groupParam.trim()
  
  // Handle simple number format: "1", "2", "3", "4"
  if (/^[1-4]$/.test(trimmed)) {
    const group = `GROUP_${trimmed}` as RetirementGroup
    return {
      success: true,
      group,
      defaultAge: GROUP_DEFAULT_AGES[group]
    }
  }

  // Normalize to uppercase and replace spaces/hyphens with underscores
  const normalized = trimmed.toUpperCase().replace(/[\s-]/g, '_')
  
  // Handle GROUP_X or GROUPX format (with or without underscore)
  const groupMatch = normalized.match(/^GROUP_?([1-4])$/)
  if (groupMatch) {
    const group = `GROUP_${groupMatch[1]}` as RetirementGroup
    return {
      success: true,
      group,
      defaultAge: GROUP_DEFAULT_AGES[group]
    }
  }

  // Invalid group parameter
  return {
    success: false,
    group: null,
    defaultAge: null,
    error: `Invalid group parameter: ${groupParam}`
  }
}

/**
 * Validates if a string is a valid retirement group
 */
export function isValidRetirementGroup(value: string): value is RetirementGroup {
  return ['GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4'].includes(value)
}

/**
 * Gets the default retirement age for a given group
 */
export function getDefaultRetirementAge(group: string): number {
  if (isValidRetirementGroup(group)) {
    return GROUP_DEFAULT_AGES[group]
  }
  return 60 // Default fallback
}

