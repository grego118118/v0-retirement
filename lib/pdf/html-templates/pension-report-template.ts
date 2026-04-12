/**
 * HTML Template for Massachusetts Pension Calculation Reports
 * Professional design with Massachusetts branding
 */

export interface PensionCalculationData {
  // Personal Information
  name?: string
  employeeId?: string
  currentAge: number
  plannedRetirementAge: number
  retirementGroup: string
  serviceEntry: string
  
  // Calculation Details
  averageSalary: number
  yearsOfService: number
  projectedYearsAtRetirement: number
  
  // Pension Results
  basePension: number
  benefitFactor: number
  totalBenefitPercentage: number
  cappedAt80Percent: boolean
  
  // Retirement Options
  options: {
    A: { annual: number; monthly: number; description: string }
    B: { annual: number; monthly: number; description: string; reduction: number }
    C: { 
      annual: number
      monthly: number
      description: string
      reduction: number
      survivorAnnual: number
      survivorMonthly: number
      beneficiaryAge?: number
    }
  }
  
  // COLA Information
  colaProjections?: {
    year: number
    startingPension: number
    colaIncrease: number
    endingPension: number
    monthlyPension: number
  }[]

  // Year-by-Year Projections - Temporarily removed to fix production API issues
  // yearlyProjections?: { ... }

  // Additional Information
  isVeteran?: boolean
  veteranBenefit?: number
  eligibilityMessage?: string
  calculationDate: Date | string | number
}

export interface PDFGenerationOptions {
  reportType?: 'basic' | 'detailed' | 'comprehensive'
  includeCharts?: boolean
  includeCOLAProjections?: boolean
  includeScenarioComparison?: boolean
  watermark?: string
}

export function generatePensionReportHTML(
  data: PensionCalculationData, 
  options: PDFGenerationOptions = {}
): string {
  const {
    reportType = 'basic',
    includeCharts = false,
    includeCOLAProjections = true,
    watermark
  } = options

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (date: Date | string | number): string => {
    // Handle different date input types and ensure we have a valid Date object
    let dateObj: Date

    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      // Fallback to current date if invalid
      dateObj = new Date()
    }

    // Validate that we have a valid date
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date()
    }

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Massachusetts Retirement System - Pension Calculation Report</title>
    <style>
        @page {
            size: A4;
            margin: 0.75in;
            @top-center {
                content: "Massachusetts Retirement System";
                font-family: 'Georgia', serif;
                font-size: 12px;
                color: #1e40af;
            }
            @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-family: 'Arial', sans-serif;
                font-size: 10px;
                color: #6b7280;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1e40af;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header-logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            gap: 20px;
        }

        .header-logo {
            height: 60px;
            width: 60px;
            flex-shrink: 0;
        }

        .header h1 {
            font-family: 'Georgia', serif;
            font-size: 32px;
            color: #1e40af;
            margin: 0;
            font-weight: bold;
            white-space: nowrap;
        }

        .header h2 {
            font-size: 18px;
            color: #374151;
            margin-bottom: 4px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
        }

        .header .disclaimer {
            font-size: 11px;
            color: #ef4444;
            font-weight: 600;
            margin-top: 8px;
            padding: 6px 12px;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            display: inline-block;
        }

        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #d1d5db;
        }

        .info-label {
            font-weight: 600;
            color: #374151;
        }

        .info-value {
            color: #1f2937;
            font-weight: 500;
        }

        .options-container {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }

        .option-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            background: #f9fafb;
        }

        .option-card.recommended {
            border-color: #10b981;
            background: #ecfdf5;
        }

        .option-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }

        .option-amount {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 4px;
        }

        .option-monthly {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }

        .option-details {
            font-size: 12px;
            color: #4b5563;
            line-height: 1.4;
        }

        .cola-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 12px;
        }

        .cola-table th,
        .cola-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: right;
        }

        .cola-table th {
            background: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }

        .cola-table tr:nth-child(even) {
            background: #f9fafb;
        }

        .summary-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .summary-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 12px;
        }

        .highlight {
            background: #fef3c7;
            padding: 2px 4px;
            border-radius: 3px;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #6b7280;
            text-align: center;
        }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            pointer-events: none;
        }

        @media print {
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    ${watermark ? `<div class="watermark">${watermark}</div>` : ''}
    
    <!-- Header -->
    <div class="header">
        <div class="header-logo-section">
            <svg class="header-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background circle for icon -->
                <rect x="4" y="4" width="40" height="40" rx="8" fill="#2563eb" />

                <!-- Financial/Retirement Icon - Stylized building with growth arrow -->
                <g transform="translate(12, 12)">
                    <!-- Building base representing stability -->
                    <rect x="2" y="16" width="4" height="8" fill="white" opacity="0.9"/>
                    <rect x="7" y="12" width="4" height="12" fill="white" opacity="0.9"/>
                    <rect x="12" y="8" width="4" height="16" fill="white" opacity="0.9"/>
                    <rect x="17" y="4" width="4" height="20" fill="white" opacity="0.9"/>

                    <!-- Growth arrow -->
                    <path d="M18 6 L22 2 L22 4 L24 4 L24 6 L22 6 L22 8 Z" fill="#10b981" />
                </g>
            </svg>
            <h1>MassPension.com</h1>
        </div>
        <h2>Pension Calculation Report</h2>
        <div class="subtitle">Generated on ${formatDate(data.calculationDate)}</div>
        <div class="disclaimer">ESTIMATION ONLY - NOT AFFILIATED WITH MSRB</div>
    </div>

    <!-- Personal Information Section -->
    <div class="section">
        <div class="section-title">Personal Information</div>
        <div class="info-grid">
            <div>
                ${data.name ? `<div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${data.name}</span>
                </div>` : ''}
                ${data.employeeId ? `<div class="info-item">
                    <span class="info-label">Employee ID:</span>
                    <span class="info-value">${data.employeeId}</span>
                </div>` : ''}
                <div class="info-item">
                    <span class="info-label">Current Age:</span>
                    <span class="info-value">${data.currentAge}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Planned Retirement Age:</span>
                    <span class="info-value">${data.plannedRetirementAge}</span>
                </div>
            </div>
            <div>
                <div class="info-item">
                    <span class="info-label">Retirement Group:</span>
                    <span class="info-value">${data.retirementGroup}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Service Entry:</span>
                    <span class="info-value">${data.serviceEntry}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Years of Service:</span>
                    <span class="info-value">${data.yearsOfService}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Average Salary:</span>
                    <span class="info-value">${formatCurrency(data.averageSalary)}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Calculation Summary -->
    <div class="section">
        <div class="section-title">Calculation Summary</div>
        <div class="summary-box">
            <div class="summary-title">Base Pension Calculation</div>
            <div class="info-grid">
                <div>
                    <div class="info-item">
                        <span class="info-label">Base Pension:</span>
                        <span class="info-value">${formatCurrency(data.basePension)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Benefit Factor:</span>
                        <span class="info-value">${formatPercentage(data.benefitFactor)}</span>
                    </div>
                </div>
                <div>
                    <div class="info-item">
                        <span class="info-label">Total Benefit Percentage:</span>
                        <span class="info-value">${data.totalBenefitPercentage}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Capped at 80%:</span>
                        <span class="info-value">${data.cappedAt80Percent ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Retirement Options -->
    <div class="section">
        <div class="section-title">Retirement Options</div>
        <div class="options-container">
            <div class="option-card">
                <div class="option-title">Option A - Full Allowance</div>
                <div class="option-amount">${formatCurrency(data.options.A.annual)}</div>
                <div class="option-monthly">Monthly: ${formatCurrency(data.options.A.monthly)}</div>
                <div class="option-details">${data.options.A.description}</div>
            </div>
            
            <div class="option-card">
                <div class="option-title">Option B - Annuity Protection</div>
                <div class="option-amount">${formatCurrency(data.options.B.annual)}</div>
                <div class="option-monthly">Monthly: ${formatCurrency(data.options.B.monthly)}</div>
                <div class="option-details">
                    ${data.options.B.description}<br>
                    <strong>Reduction:</strong> ${formatPercentage(data.options.B.reduction)}
                </div>
            </div>
            
            <div class="option-card">
                <div class="option-title">Option C - Joint & Survivor</div>
                <div class="option-amount">${formatCurrency(data.options.C.annual)}</div>
                <div class="option-monthly">Monthly: ${formatCurrency(data.options.C.monthly)}</div>
                <div class="option-details">
                    ${data.options.C.description}<br>
                    <strong>Reduction:</strong> ${formatPercentage(data.options.C.reduction)}<br>
                    <strong>Survivor Benefit:</strong> ${formatCurrency(data.options.C.survivorAnnual)} annually
                </div>
            </div>
        </div>
    </div>

    ${includeCOLAProjections && data.colaProjections ? `
    <!-- COLA Projections -->
    <div class="section page-break">
        <div class="section-title">Cost of Living Adjustments (COLA) Projections</div>
        <p style="margin-bottom: 15px; color: #6b7280; font-size: 14px;">
            Massachusetts COLA: 3% rate applied to first $13,000 of annual allowance only ($390 annual cap)
        </p>
        <table class="cola-table">
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Starting Pension</th>
                    <th>COLA Increase</th>
                    <th>Ending Pension</th>
                    <th>Monthly Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.colaProjections.slice(0, 10).map(projection => `
                <tr>
                    <td>Year ${projection.year}</td>
                    <td>${formatCurrency(projection.startingPension)}</td>
                    <td>${formatCurrency(projection.colaIncrease)}</td>
                    <td>${formatCurrency(projection.endingPension)}</td>
                    <td>${formatCurrency(projection.monthlyPension)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <!-- Year-by-Year Projections - Temporarily removed to fix production API issues -->
    <!-- Will be re-added in a future update with improved performance -->

    ${data.isVeteran && data.veteranBenefit ? `
    <!-- Veteran Benefits -->
    <div class="section">
        <div class="section-title">Veteran Benefits</div>
        <div class="summary-box">
            <div class="info-item">
                <span class="info-label">Additional Veteran Benefit:</span>
                <span class="info-value highlight">${formatCurrency(data.veteranBenefit)}</span>
            </div>
        </div>
    </div>
    ` : ''}

    <!-- Important Notes -->
    <div class="section">
        <div class="section-title">Important Notes</div>
        <ul style="margin-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
            <li>This calculation is based on current Massachusetts Retirement System rules and may be subject to change.</li>
            <li>COLA adjustments are applied annually with a 3% rate on the first $13,000 of pension benefits.</li>
            <li>Actual benefits may vary based on final salary calculations and service verification.</li>
            <li>Consult with the Massachusetts Retirement Board for official benefit determinations.</li>
            ${data.eligibilityMessage ? `<li><strong>Eligibility:</strong> ${data.eligibilityMessage}</li>` : ''}
        </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This report was generated by MassPension.com on ${formatDate(data.calculationDate)}.</p>
        <p><strong>IMPORTANT DISCLAIMER:</strong> This is an estimation tool only and is not affiliated with the Massachusetts State Retirement Board (MSRB). For official benefit calculations and retirement planning, please contact the Massachusetts Retirement Board directly.</p>
        <p>© ${new Date().getFullYear()} MassPension.com - Independent Retirement Planning Tool</p>
    </div>
</body>
</html>
  `.trim()
}
