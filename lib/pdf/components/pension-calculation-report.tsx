/**
 * Basic Pension Calculation PDF Report Component
 * Professional PDF report for Massachusetts pension calculations
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { 
  PensionCalculationData, 
  PDFGenerationOptions,
  formatCurrency,
  formatPercentage,
  getRetirementGroupDisplayName,
  getServiceEntryDisplayName
} from '../pdf-generator'

// PDF Styles
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
  logo: {
    width: 120,
    height: 40,
  },
  headerText: {
    textAlign: 'right',
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
    marginBottom: 25,
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
    marginBottom: 8,
    paddingVertical: 4,
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
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  optionsContainer: {
    marginTop: 15,
  },
  optionCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
  },
  optionDetails: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 4,
  },
  optionAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
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
    marginTop: 20,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.4,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 48,
    color: '#f3f4f6',
    opacity: 0.3,
    zIndex: -1,
  },
})

interface PensionCalculationReportProps {
  data: PensionCalculationData
  options: PDFGenerationOptions
}

export const PensionCalculationReport: React.FC<PensionCalculationReportProps> = ({ data, options }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {options.watermark && (
          <Text style={styles.watermark}>{options.watermark}</Text>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mass Pension</Text>
            <Text style={styles.subtitle}>Massachusetts Retirement Calculator</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.subtitle}>Report Generated: {currentDate}</Text>
            <Text style={styles.subtitle}>www.masspension.com</Text>
          </View>
        </View>

        {/* Report Title */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20, textAlign: 'center', marginBottom: 20 }]}>
            Massachusetts Pension Calculation Report
          </Text>
          {data.name && (
            <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 10 }]}>
              Prepared for: {data.name}
            </Text>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Age:</Text>
            <Text style={styles.value}>{data.currentAge} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Planned Retirement Age:</Text>
            <Text style={styles.value}>{data.plannedRetirementAge} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Retirement Group:</Text>
            <Text style={styles.value}>{getRetirementGroupDisplayName(data.retirementGroup)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Service Entry Date:</Text>
            <Text style={styles.value}>{getServiceEntryDisplayName(data.serviceEntry)}</Text>
          </View>
          {data.employeeId && (
            <View style={styles.row}>
              <Text style={styles.label}>Employee ID:</Text>
              <Text style={styles.value}>{data.employeeId}</Text>
            </View>
          )}
        </View>

        {/* Calculation Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculation Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Average Salary (High-3):</Text>
            <Text style={styles.value}>{formatCurrency(data.averageSalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current Years of Service:</Text>
            <Text style={styles.value}>{data.yearsOfService} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Projected Years at Retirement:</Text>
            <Text style={styles.value}>{data.projectedYearsAtRetirement} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Benefit Factor:</Text>
            <Text style={styles.value}>{formatPercentage(data.benefitFactor)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Benefit Percentage:</Text>
            <Text style={styles.value}>{formatPercentage(data.totalBenefitPercentage)}</Text>
          </View>
          
          {/* Base Pension Highlight */}
          <View style={[styles.row, styles.highlightRow]}>
            <Text style={styles.label}>Base Annual Pension:</Text>
            <Text style={[styles.value, styles.highlightValue]}>{formatCurrency(data.basePension)}</Text>
          </View>
          
          {data.cappedAt80Percent && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: '#dc2626' }]}>80% Maximum Cap Applied:</Text>
              <Text style={[styles.value, { color: '#dc2626' }]}>Yes</Text>
            </View>
          )}
          
          {data.isVeteran && data.veteranBenefit && (
            <View style={styles.row}>
              <Text style={styles.label}>Veteran Benefit:</Text>
              <Text style={styles.value}>{formatCurrency(data.veteranBenefit)}</Text>
            </View>
          )}
        </View>

        {/* Retirement Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Retirement Options</Text>
          
          {/* Option A */}
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>Option A: Full Allowance (100%)</Text>
            <Text style={styles.optionDetails}>{data.options.A.description}</Text>
            <Text style={styles.optionAmount}>
              Annual: {formatCurrency(data.options.A.annual)} | Monthly: {formatCurrency(data.options.A.monthly)}
            </Text>
          </View>

          {/* Option B */}
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>Option B: Annuity Protection</Text>
            <Text style={styles.optionDetails}>{data.options.B.description}</Text>
            <Text style={styles.optionAmount}>
              Annual: {formatCurrency(data.options.B.annual)} | Monthly: {formatCurrency(data.options.B.monthly)}
            </Text>
            <Text style={styles.optionDetails}>
              Reduction: {formatPercentage(data.options.B.reduction)}
            </Text>
          </View>

          {/* Option C */}
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>Option C: Joint & Survivor (66.67%)</Text>
            <Text style={styles.optionDetails}>{data.options.C.description}</Text>
            <Text style={styles.optionAmount}>
              Member Annual: {formatCurrency(data.options.C.annual)} | Monthly: {formatCurrency(data.options.C.monthly)}
            </Text>
            <Text style={styles.optionAmount}>
              Survivor Annual: {formatCurrency(data.options.C.survivorAnnual)} | Monthly: {formatCurrency(data.options.C.survivorMonthly)}
            </Text>
            <Text style={styles.optionDetails}>
              Member Reduction: {formatPercentage(data.options.C.reduction)}
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            IMPORTANT DISCLAIMER: This report provides estimates based on current Massachusetts State Retirement Board (MSRB) 
            calculation methods and should be used for planning purposes only. Actual benefits may vary based on final salary, 
            years of service, and changes to retirement laws. Please verify all calculations with the official MSRB calculator 
            and consult with MSRB representatives before making final retirement decisions. This report was generated by 
            Mass Pension (www.masspension.com) and is not an official MSRB document.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Mass Pension - Massachusetts Retirement Calculator | www.masspension.com | Page 1 of 1
        </Text>
      </Page>
    </Document>
  )
}
