/**
 * Combined Retirement Planning PDF Report Component
 * Comprehensive PDF report including pension, Social Security, and additional income sources
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { 
  CombinedCalculationData, 
  PDFGenerationOptions,
  formatCurrency,
  formatPercentage,
  getRetirementGroupDisplayName,
  getServiceEntryDisplayName
} from '../pdf-generator'

// PDF Styles (extending from pension report)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
    flex: 1,
  },
  value: {
    fontSize: 11,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  highlightRow: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 4,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  summaryCard: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
  },
  incomeBreakdown: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  incomeSource: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  incomeLabel: {
    fontSize: 10,
    color: '#4b5563',
  },
  incomeAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.4,
  },
  pageBreak: {
    pageBreakBefore: 'always',
  },
})

interface CombinedRetirementReportProps {
  data: CombinedCalculationData
  options: PDFGenerationOptions
}

export const CombinedRetirementReport: React.FC<CombinedRetirementReportProps> = ({ data, options }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const { pensionData, socialSecurityData, additionalIncome } = data

  // Calculate total retirement income
  const totalMonthlyIncome = 
    (pensionData.options.A.monthly || 0) +
    (socialSecurityData?.estimatedBenefit || 0) +
    ((additionalIncome?.traditional401k || 0) + (additionalIncome?.rothIRA || 0)) * 0.04 / 12 + // 4% withdrawal rule
    (additionalIncome?.partTimeIncome || 0) +
    (additionalIncome?.rentalIncome || 0)

  const totalAnnualIncome = totalMonthlyIncome * 12

  return (
    <Document>
      {/* Page 1: Executive Summary */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mass Pension</Text>
            <Text style={styles.subtitle}>Massachusetts Retirement Calculator</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.subtitle}>Report Generated: {currentDate}</Text>
            <Text style={styles.subtitle}>www.masspension.com</Text>
          </View>
        </View>

        {/* Report Title */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20, textAlign: 'center', marginBottom: 20 }]}>
            Comprehensive Retirement Analysis Report
          </Text>
          {pensionData.name && (
            <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 15 }]}>
              Prepared for: {pensionData.name}
            </Text>
          )}
        </View>

        {/* Executive Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Projected Retirement Income</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(totalMonthlyIncome)}/month
          </Text>
          <Text style={[styles.summaryAmount, { fontSize: 12, marginTop: 5 }]}>
            ({formatCurrency(totalAnnualIncome)}/year)
          </Text>
        </View>

        {/* Income Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Income Breakdown</Text>
          
          <View style={styles.incomeBreakdown}>
            <View style={styles.incomeSource}>
              <Text style={styles.incomeLabel}>Massachusetts Pension (Option A):</Text>
              <Text style={styles.incomeAmount}>{formatCurrency(pensionData.options.A.monthly)}</Text>
            </View>
            
            {socialSecurityData && (
              <View style={styles.incomeSource}>
                <Text style={styles.incomeLabel}>Social Security Benefits:</Text>
                <Text style={styles.incomeAmount}>{formatCurrency(socialSecurityData.estimatedBenefit)}</Text>
              </View>
            )}
            
            {additionalIncome && (
              <>
                {(additionalIncome.traditional401k || additionalIncome.rothIRA) && (
                  <View style={styles.incomeSource}>
                    <Text style={styles.incomeLabel}>Retirement Account Withdrawals (4%):</Text>
                    <Text style={styles.incomeAmount}>
                      {formatCurrency(((additionalIncome.traditional401k || 0) + (additionalIncome.rothIRA || 0)) * 0.04 / 12)}
                    </Text>
                  </View>
                )}
                
                {additionalIncome.partTimeIncome && (
                  <View style={styles.incomeSource}>
                    <Text style={styles.incomeLabel}>Part-time Income:</Text>
                    <Text style={styles.incomeAmount}>{formatCurrency(additionalIncome.partTimeIncome)}</Text>
                  </View>
                )}
                
                {additionalIncome.rentalIncome && (
                  <View style={styles.incomeSource}>
                    <Text style={styles.incomeLabel}>Rental Income:</Text>
                    <Text style={styles.incomeAmount}>{formatCurrency(additionalIncome.rentalIncome)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Retirement Metrics</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Retirement Age:</Text>
            <Text style={styles.value}>{pensionData.plannedRetirementAge} years</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Years Until Retirement:</Text>
            <Text style={styles.value}>{pensionData.plannedRetirementAge - pensionData.currentAge} years</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Income Replacement Ratio:</Text>
            <Text style={styles.value}>
              {formatPercentage(totalAnnualIncome / pensionData.averageSalary)}
            </Text>
          </View>
          
          {data.targetMonthlyIncome && (
            <View style={styles.row}>
              <Text style={styles.label}>Target vs. Projected Income:</Text>
              <Text style={[styles.value, totalMonthlyIncome >= data.targetMonthlyIncome ? { color: '#059669' } : { color: '#dc2626' }]}>
                {totalMonthlyIncome >= data.targetMonthlyIncome ? 'Target Met' : 'Below Target'}
              </Text>
            </View>
          )}
        </View>

        {/* Personal Information Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Age:</Text>
            <Text style={styles.value}>{pensionData.currentAge} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Retirement Group:</Text>
            <Text style={styles.value}>{getRetirementGroupDisplayName(pensionData.retirementGroup)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Years of Service:</Text>
            <Text style={styles.value}>{pensionData.yearsOfService} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Salary:</Text>
            <Text style={styles.value}>{formatCurrency(pensionData.averageSalary)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Mass Pension - Massachusetts Retirement Calculator | www.masspension.com | Page 1 of 2
        </Text>
      </Page>

      {/* Page 2: Detailed Analysis */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mass Pension</Text>
            <Text style={styles.subtitle}>Detailed Analysis</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.subtitle}>Page 2 of 2</Text>
          </View>
        </View>

        {/* Pension Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Massachusetts Pension Details</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Benefit Factor:</Text>
            <Text style={styles.value}>{formatPercentage(pensionData.benefitFactor)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Total Benefit Percentage:</Text>
            <Text style={styles.value}>{formatPercentage(pensionData.totalBenefitPercentage)}</Text>
          </View>
          
          <View style={[styles.row, styles.highlightRow]}>
            <Text style={styles.label}>Base Annual Pension:</Text>
            <Text style={[styles.value, styles.highlightValue]}>{formatCurrency(pensionData.basePension)}</Text>
          </View>
          
          {pensionData.cappedAt80Percent && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: '#dc2626' }]}>80% Maximum Cap Applied:</Text>
              <Text style={[styles.value, { color: '#dc2626' }]}>Yes</Text>
            </View>
          )}
        </View>

        {/* Social Security Details */}
        {socialSecurityData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Security Analysis</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Estimated Monthly Benefit:</Text>
              <Text style={styles.value}>{formatCurrency(socialSecurityData.estimatedBenefit)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Full Retirement Age:</Text>
              <Text style={styles.value}>{socialSecurityData.fullRetirementAge}</Text>
            </View>
            
            {socialSecurityData.spousalBenefit && (
              <View style={styles.row}>
                <Text style={styles.label}>Spousal Benefit:</Text>
                <Text style={styles.value}>{formatCurrency(socialSecurityData.spousalBenefit)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Additional Income Sources */}
        {additionalIncome && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Income Sources</Text>
            
            {additionalIncome.traditional401k && (
              <View style={styles.row}>
                <Text style={styles.label}>Traditional 401(k) Balance:</Text>
                <Text style={styles.value}>{formatCurrency(additionalIncome.traditional401k)}</Text>
              </View>
            )}
            
            {additionalIncome.rothIRA && (
              <View style={styles.row}>
                <Text style={styles.label}>Roth IRA Balance:</Text>
                <Text style={styles.value}>{formatCurrency(additionalIncome.rothIRA)}</Text>
              </View>
            )}
            
            {additionalIncome.otherRetirementAccounts && (
              <View style={styles.row}>
                <Text style={styles.label}>Other Retirement Accounts:</Text>
                <Text style={styles.value}>{formatCurrency(additionalIncome.otherRetirementAccounts)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            IMPORTANT DISCLAIMER: This comprehensive retirement analysis provides estimates based on current information and 
            should be used for planning purposes only. Actual benefits may vary based on changes to laws, market conditions, 
            and personal circumstances. Social Security estimates are based on current benefit formulas and may change. 
            Investment projections assume a 4% withdrawal rate and may not reflect actual market performance. Please consult 
            with financial advisors and official benefit administrators before making final retirement decisions.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Mass Pension - Massachusetts Retirement Calculator | www.masspension.com | Page 2 of 2
        </Text>
      </Page>
    </Document>
  )
}
