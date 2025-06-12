"use client"

import React from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { calculateCurrentAge, calculateYearsOfService } from '@/lib/standardized-pension-calculator'

interface ProfileSummaryProps {
  profile: {
    id: string
    dateOfBirth: Date
    membershipDate: Date
    retirementGroup: string
    currentSalary: number
    averageHighest3Years?: number
    yearsOfService?: number
    plannedRetirementAge?: number
    retirementOption?: string
  }
  user: {
    id: string
    name?: string
    email: string
  }
}

export function ProfileSummary({ profile, user }: ProfileSummaryProps) {
  const currentAge = calculateCurrentAge(profile.dateOfBirth)
  const yearsOfService = profile.yearsOfService || calculateYearsOfService(profile.membershipDate)
  
  const getRetirementGroupDescription = (group: string) => {
    switch (group) {
      case '1':
        return 'Group 1 - General Employees'
      case '2':
        return 'Group 2 - Probation Officers, Court Officers, Certain Corrections'
      case '3':
        return 'Group 3 - State Police'
      case '4':
        return 'Group 4 - Public Safety, Corrections, Parole Officers'
      default:
        return `Group ${group}`
    }
  }

  const getRetirementOptionDescription = (option?: string) => {
    switch (option) {
      case 'A':
        return 'Option A - Maximum Benefit (No Survivor Benefit)'
      case 'B':
        return 'Option B - Joint and Survivor Benefit'
      case 'C':
        return 'Option C - Ten Year Certain'
      default:
        return 'Not Selected'
    }
  }

  const getEligibilityStatus = () => {
    const minRetirementAge = profile.retirementGroup === '4' ? 50 : 
                            profile.retirementGroup === '3' ? 55 : 
                            profile.retirementGroup === '2' ? 55 : 55

    const minYearsOfService = profile.retirementGroup === '1' ? 10 : 20

    if (currentAge >= minRetirementAge && yearsOfService >= minYearsOfService) {
      return {
        status: 'Eligible',
        description: 'You are currently eligible for retirement benefits.',
        color: 'text-green-700 bg-green-50 border-green-200'
      }
    } else if (currentAge >= minRetirementAge) {
      return {
        status: 'Partially Eligible',
        description: `You need ${minYearsOfService - yearsOfService} more years of service.`,
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
      }
    } else {
      const yearsToRetirement = minRetirementAge - currentAge
      return {
        status: 'Not Yet Eligible',
        description: `You can retire in ${yearsToRetirement} years at age ${minRetirementAge}.`,
        color: 'text-blue-700 bg-blue-50 border-blue-200'
      }
    }
  }

  const eligibility = getEligibilityStatus()

  return (
    <section className="report-section page-break-avoid">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Personal Profile Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Personal Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Full Name:</span>
              <span className="text-sm text-gray-900">{user.name || 'Not Provided'}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
              <span className="text-sm text-gray-900">{formatDate(profile.dateOfBirth)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Current Age:</span>
              <span className="text-sm text-gray-900">{currentAge} years</span>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Employment Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Membership Date:</span>
              <span className="text-sm text-gray-900">{formatDate(profile.membershipDate)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Years of Service:</span>
              <span className="text-sm text-gray-900">{yearsOfService.toFixed(1)} years</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Retirement Group:</span>
              <span className="text-sm text-gray-900">{getRetirementGroupDescription(profile.retirementGroup)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Current Salary:</span>
              <span className="text-sm text-gray-900">{formatCurrency(profile.currentSalary)}</span>
            </div>
            
            {profile.averageHighest3Years && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Average Highest 3 Years:</span>
                <span className="text-sm text-gray-900">{formatCurrency(profile.averageHighest3Years)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retirement Planning Information */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retirement Plans */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Retirement Planning</h3>
          
          <div className="space-y-3">
            {profile.plannedRetirementAge && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Planned Retirement Age:</span>
                <span className="text-sm text-gray-900">{profile.plannedRetirementAge} years</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Retirement Option:</span>
              <span className="text-sm text-gray-900">{getRetirementOptionDescription(profile.retirementOption)}</span>
            </div>
            
            {profile.plannedRetirementAge && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Years to Retirement:</span>
                <span className="text-sm text-gray-900">
                  {Math.max(0, profile.plannedRetirementAge - currentAge)} years
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Status */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Eligibility Status</h3>
          
          <div className={`p-4 rounded-lg border ${eligibility.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Current Status:</span>
              <span className="text-sm font-bold">{eligibility.status}</span>
            </div>
            <p className="text-sm">{eligibility.description}</p>
          </div>

          {/* Key Milestones */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Key Milestones:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Minimum Retirement Age:</span>
                <span className="font-medium">
                  {profile.retirementGroup === '4' ? '50' : 
                   profile.retirementGroup === '3' ? '55' : 
                   profile.retirementGroup === '2' ? '55' : '55'} years
                </span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Service Required:</span>
                <span className="font-medium">
                  {profile.retirementGroup === '1' ? '10' : '20'} years
                </span>
              </div>
              <div className="flex justify-between">
                <span>Maximum Benefit Age:</span>
                <span className="font-medium">
                  {profile.retirementGroup === '3' ? '55' : 
                   profile.retirementGroup === '4' ? '55' : 
                   profile.retirementGroup === '2' ? '60' : '65'} years
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Profile Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-blue-600">{currentAge}</div>
            <div className="text-xs text-gray-600">Current Age</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-green-600">{yearsOfService.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Years of Service</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-purple-600">
              {profile.plannedRetirementAge || 'TBD'}
            </div>
            <div className="text-xs text-gray-600">Planned Retirement</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-orange-600">Group {profile.retirementGroup}</div>
            <div className="text-xs text-gray-600">Retirement Group</div>
          </div>
        </div>
      </div>
    </section>
  )
}
