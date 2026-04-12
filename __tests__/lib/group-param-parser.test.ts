/**
 * Unit tests for group query parameter parsing and normalization
 * Tests the logic used to pre-select retirement groups from URL parameters
 */

import {
  parseGroupParam,
  isValidRetirementGroup,
  getDefaultRetirementAge,
  GROUP_DEFAULT_AGES,
  RetirementGroup,
  GroupParamResult
} from '@/lib/utils/group-param-parser'

describe('Group Parameter Parser', () => {
  describe('parseGroupParam', () => {
    describe('Simple number format', () => {
      it('should parse "1" as GROUP_1 with age 60', () => {
        const result = parseGroupParam('1')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_1')
        expect(result.defaultAge).toBe(60)
      })

      it('should parse "2" as GROUP_2 with age 55', () => {
        const result = parseGroupParam('2')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_2')
        expect(result.defaultAge).toBe(55)
      })

      it('should parse "3" as GROUP_3 with age 45 (MA State Police - any age with 20+ yrs)', () => {
        const result = parseGroupParam('3')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_3')
        expect(result.defaultAge).toBe(45)
      })

      it('should parse "4" as GROUP_4 with age 50', () => {
        const result = parseGroupParam('4')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_4')
        expect(result.defaultAge).toBe(50)
      })
    })

    describe('GROUP_X format', () => {
      it('should parse "GROUP_1" correctly', () => {
        const result = parseGroupParam('GROUP_1')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_1')
      })

      it('should parse "GROUP_4" correctly', () => {
        const result = parseGroupParam('GROUP_4')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_4')
      })

      it('should handle lowercase "group_2"', () => {
        const result = parseGroupParam('group_2')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_2')
      })

      it('should handle mixed case "Group_3"', () => {
        const result = parseGroupParam('Group_3')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_3')
      })
    })

    describe('Alternative formats', () => {
      it('should parse "GROUP1" (no underscore) correctly', () => {
        const result = parseGroupParam('GROUP1')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_1')
      })

      it('should parse "group-2" (hyphen) correctly', () => {
        const result = parseGroupParam('group-2')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_2')
      })

      it('should parse "Group 3" (space) correctly', () => {
        const result = parseGroupParam('Group 3')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_3')
      })

      it('should handle URL-encoded space "Group%201"', () => {
        // URL decoding would have already happened, so test with actual space
        const result = parseGroupParam('Group 1')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_1')
      })
    })

    describe('Edge cases - whitespace', () => {
      it('should trim leading/trailing whitespace', () => {
        const result = parseGroupParam('  2  ')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_2')
      })

      it('should handle tab characters in input', () => {
        const result = parseGroupParam('\t3\t')
        expect(result.success).toBe(true)
        expect(result.group).toBe('GROUP_3')
      })
    })

    describe('Invalid inputs', () => {
      it('should reject "5" as invalid group number', () => {
        const result = parseGroupParam('5')
        expect(result.success).toBe(false)
        expect(result.group).toBeNull()
        expect(result.error).toContain('Invalid group parameter')
      })

      it('should reject "0" as invalid group number', () => {
        const result = parseGroupParam('0')
        expect(result.success).toBe(false)
        expect(result.group).toBeNull()
      })

      it('should reject negative numbers', () => {
        const result = parseGroupParam('-1')
        expect(result.success).toBe(false)
        expect(result.group).toBeNull()
      })

      it('should reject "invalid" text', () => {
        const result = parseGroupParam('invalid')
        expect(result.success).toBe(false)
        expect(result.error).toContain('invalid')
      })

      it('should reject "GROUP_5"', () => {
        const result = parseGroupParam('GROUP_5')
        expect(result.success).toBe(false)
        expect(result.group).toBeNull()
      })

      it('should reject empty string', () => {
        const result = parseGroupParam('')
        expect(result.success).toBe(false)
        expect(result.error).toContain('No group parameter')
      })

      it('should reject null', () => {
        const result = parseGroupParam(null)
        expect(result.success).toBe(false)
        expect(result.error).toContain('No group parameter')
      })

      it('should reject whitespace-only string', () => {
        const result = parseGroupParam('   ')
        expect(result.success).toBe(false)
        expect(result.group).toBeNull()
      })
    })
  })

  describe('isValidRetirementGroup', () => {
    it('should return true for valid groups', () => {
      expect(isValidRetirementGroup('GROUP_1')).toBe(true)
      expect(isValidRetirementGroup('GROUP_2')).toBe(true)
      expect(isValidRetirementGroup('GROUP_3')).toBe(true)
      expect(isValidRetirementGroup('GROUP_4')).toBe(true)
    })

    it('should return false for invalid groups', () => {
      expect(isValidRetirementGroup('GROUP_5')).toBe(false)
      expect(isValidRetirementGroup('GROUP_0')).toBe(false)
      expect(isValidRetirementGroup('1')).toBe(false)
      expect(isValidRetirementGroup('invalid')).toBe(false)
      expect(isValidRetirementGroup('')).toBe(false)
    })
  })

  describe('getDefaultRetirementAge', () => {
    it('should return correct age for each group', () => {
      expect(getDefaultRetirementAge('GROUP_1')).toBe(60)
      expect(getDefaultRetirementAge('GROUP_2')).toBe(55)
      expect(getDefaultRetirementAge('GROUP_3')).toBe(45) // MA State Police - any age with 20+ yrs
      expect(getDefaultRetirementAge('GROUP_4')).toBe(50)
    })

    it('should return fallback age 60 for invalid groups', () => {
      expect(getDefaultRetirementAge('GROUP_5')).toBe(60)
      expect(getDefaultRetirementAge('invalid')).toBe(60)
      expect(getDefaultRetirementAge('')).toBe(60)
    })
  })

  describe('GROUP_DEFAULT_AGES constant', () => {
    it('should have correct MSRB minimum ages', () => {
      // Group 1: General employees - minimum age 60
      expect(GROUP_DEFAULT_AGES.GROUP_1).toBe(60)

      // Group 2: Probation/Court officers - minimum age 55
      expect(GROUP_DEFAULT_AGES.GROUP_2).toBe(55)

      // Group 3: MA State Police ONLY - any age with 20+ years (practical default 45 for early career starters)
      expect(GROUP_DEFAULT_AGES.GROUP_3).toBe(45)

      // Group 4: Municipal Police/Fire/Corrections - minimum age 50
      expect(GROUP_DEFAULT_AGES.GROUP_4).toBe(50)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle the user flow from group landing pages', () => {
      // Simulating: User clicks "Calculate My Group 1 Pension" on /calculator/group-1
      // URL becomes: /calculator?group=1
      const result = parseGroupParam('1')

      expect(result.success).toBe(true)
      expect(result.group).toBe('GROUP_1')
      expect(result.defaultAge).toBe(60)
    })

    it('should handle all 4 group landing page flows', () => {
      const testCases = [
        { param: '1', expectedGroup: 'GROUP_1', expectedAge: 60 },
        { param: '2', expectedGroup: 'GROUP_2', expectedAge: 55 },
        { param: '3', expectedGroup: 'GROUP_3', expectedAge: 45 }, // MA State Police - any age with 20+ yrs
        { param: '4', expectedGroup: 'GROUP_4', expectedAge: 50 },
      ]

      testCases.forEach(({ param, expectedGroup, expectedAge }) => {
        const result = parseGroupParam(param)
        expect(result.success).toBe(true)
        expect(result.group).toBe(expectedGroup)
        expect(result.defaultAge).toBe(expectedAge)
      })
    })
  })
})

