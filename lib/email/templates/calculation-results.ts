/**
 * Calculation Results Email Template
 * Sent when users request their calculation results via email
 */

export interface CalculationResultsEmailData {
  name: string
  email: string
  calculationType: 'pension' | 'social-security' | 'combined'
  results: {
    monthlyPension?: number
    annualPension?: number
    socialSecurityBenefit?: number
    totalMonthlyIncome?: number
    totalAnnualIncome?: number
    retirementAge?: number
    yearsOfService?: number
    group?: string
  }
  calculationDate: string
  dashboardUrl: string
  calculatorUrl: string
  supportUrl: string
}

export default function calculationResultsTemplate(data: CalculationResultsEmailData) {
  const getCalculationTypeLabel = () => {
    switch (data.calculationType) {
      case 'pension':
        return 'Massachusetts Pension Calculation'
      case 'social-security':
        return 'Social Security Benefits Calculation'
      case 'combined':
        return 'Combined Retirement Benefits Calculation'
      default:
        return 'Retirement Calculation'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const subject = `Your ${getCalculationTypeLabel()} Results`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Retirement Calculation Results</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1e40af;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #64748b;
          font-size: 16px;
        }
        .content {
          margin-bottom: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #1e40af;
        }
        .calculation-summary {
          background-color: #f1f5f9;
          padding: 25px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #1e40af;
        }
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .result-card {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        .result-card.primary {
          border-color: #1e40af;
          background-color: #f8fafc;
        }
        .result-label {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .result-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .result-period {
          font-size: 12px;
          color: #64748b;
        }
        .calculation-details {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-label {
          color: #64748b;
          font-weight: 500;
        }
        .detail-value {
          color: #1e40af;
          font-weight: 600;
        }
        .important-notice {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .next-steps {
          background-color: #f0f9ff;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #0ea5e9;
          margin: 20px 0;
        }
        .next-steps ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .cta-section {
          text-align: center;
          margin: 30px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #1e40af;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 10px;
        }
        .cta-button:hover {
          background-color: #1d4ed8;
        }
        .secondary-button {
          background-color: #64748b;
        }
        .secondary-button:hover {
          background-color: #475569;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .footer a {
          color: #1e40af;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Massachusetts Retirement System</div>
          <div class="subtitle">Your Calculation Results</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${data.name},</div>
          
          <p>Here are your ${getCalculationTypeLabel().toLowerCase()} results calculated on ${data.calculationDate}.</p>
          
          <div class="calculation-summary">
            <h3 style="margin-top: 0; color: #1e40af;">📊 ${getCalculationTypeLabel()}</h3>
            
            <div class="results-grid">
              ${data.results.monthlyPension ? `
                <div class="result-card primary">
                  <div class="result-label">Monthly Pension</div>
                  <div class="result-value">${formatCurrency(data.results.monthlyPension)}</div>
                  <div class="result-period">per month</div>
                </div>
              ` : ''}
              
              ${data.results.annualPension ? `
                <div class="result-card">
                  <div class="result-label">Annual Pension</div>
                  <div class="result-value">${formatCurrency(data.results.annualPension)}</div>
                  <div class="result-period">per year</div>
                </div>
              ` : ''}
              
              ${data.results.socialSecurityBenefit ? `
                <div class="result-card">
                  <div class="result-label">Social Security</div>
                  <div class="result-value">${formatCurrency(data.results.socialSecurityBenefit)}</div>
                  <div class="result-period">per month</div>
                </div>
              ` : ''}
              
              ${data.results.totalMonthlyIncome ? `
                <div class="result-card primary">
                  <div class="result-label">Total Monthly Income</div>
                  <div class="result-value">${formatCurrency(data.results.totalMonthlyIncome)}</div>
                  <div class="result-period">per month</div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="calculation-details">
            <h3 style="margin-top: 0; color: #1e40af;">Calculation Details</h3>
            
            ${data.results.retirementAge ? `
              <div class="detail-item">
                <span class="detail-label">Retirement Age:</span>
                <span class="detail-value">${data.results.retirementAge} years</span>
              </div>
            ` : ''}
            
            ${data.results.yearsOfService ? `
              <div class="detail-item">
                <span class="detail-label">Years of Service:</span>
                <span class="detail-value">${data.results.yearsOfService} years</span>
              </div>
            ` : ''}
            
            ${data.results.group ? `
              <div class="detail-item">
                <span class="detail-label">Retirement Group:</span>
                <span class="detail-value">Group ${data.results.group}</span>
              </div>
            ` : ''}
            
            <div class="detail-item">
              <span class="detail-label">Calculation Date:</span>
              <span class="detail-value">${data.calculationDate}</span>
            </div>
          </div>
          
          <div class="important-notice">
            <strong>⚠️ Important Disclaimer:</strong> These calculations are estimates based on current Massachusetts Retirement System rules and the information you provided. Actual benefits may vary based on final salary calculations, service credit verification, and changes to retirement laws. Please consult with the Massachusetts State Retirement Board for official benefit calculations.
          </div>
          
          <div class="next-steps">
            <h3 style="margin-top: 0; color: #0ea5e9;">🎯 Recommended Next Steps:</h3>
            <ul>
              <li><strong>Save your calculation:</strong> Access your dashboard to save and track this scenario</li>
              <li><strong>Explore options:</strong> Try different retirement ages and scenarios</li>
              <li><strong>Tax planning:</strong> Use our tax calculator to understand your net income</li>
              <li><strong>Social Security:</strong> Optimize your claiming strategy for maximum benefits</li>
              <li><strong>Professional review:</strong> Consider consulting with a financial advisor</li>
              ${data.calculationType !== 'combined' ? '<li><strong>Complete analysis:</strong> Run a combined calculation for full retirement planning</li>' : ''}
            </ul>
          </div>
          
          <div class="cta-section">
            <a href="${data.dashboardUrl}" class="cta-button">View in Dashboard</a>
            <a href="${data.calculatorUrl}" class="cta-button secondary-button">Run New Calculation</a>
          </div>
          
          <p>Want to explore different scenarios or need help understanding your results? Our calculator offers multiple tools to help you plan the perfect retirement strategy.</p>
          
          <p>Questions about your calculation? <a href="${data.supportUrl}" style="color: #1e40af;">Contact our support team</a> for personalized assistance.</p>
        </div>
        
        <div class="footer">
          <p>This calculation was generated for ${data.email} on ${data.calculationDate}</p>
          
          <p style="margin-top: 20px;">
            <a href="${data.dashboardUrl}">Dashboard</a> |
            <a href="${data.calculatorUrl}">Calculator</a> |
            <a href="${data.supportUrl}">Support</a>
          </p>
          
          <p style="margin-top: 20px;">
            <small>
              Massachusetts Retirement System Calculator<br>
              Professional retirement planning for Massachusetts public employees<br>
              © 2024 All rights reserved
            </small>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
${subject}

Hello ${data.name},

Here are your ${getCalculationTypeLabel().toLowerCase()} results calculated on ${data.calculationDate}.

CALCULATION RESULTS:
${data.results.monthlyPension ? `Monthly Pension: ${formatCurrency(data.results.monthlyPension)}` : ''}
${data.results.annualPension ? `Annual Pension: ${formatCurrency(data.results.annualPension)}` : ''}
${data.results.socialSecurityBenefit ? `Social Security: ${formatCurrency(data.results.socialSecurityBenefit)}/month` : ''}
${data.results.totalMonthlyIncome ? `Total Monthly Income: ${formatCurrency(data.results.totalMonthlyIncome)}` : ''}

CALCULATION DETAILS:
${data.results.retirementAge ? `Retirement Age: ${data.results.retirementAge} years` : ''}
${data.results.yearsOfService ? `Years of Service: ${data.results.yearsOfService} years` : ''}
${data.results.group ? `Retirement Group: Group ${data.results.group}` : ''}
Calculation Date: ${data.calculationDate}

IMPORTANT DISCLAIMER: These calculations are estimates based on current Massachusetts Retirement System rules and the information you provided. Actual benefits may vary. Please consult with the Massachusetts State Retirement Board for official benefit calculations.

RECOMMENDED NEXT STEPS:
• Save your calculation in your dashboard
• Explore different retirement scenarios
• Use our tax calculator for net income analysis
• Optimize your Social Security claiming strategy
• Consider consulting with a financial advisor

Quick Links:
- Dashboard: ${data.dashboardUrl}
- Calculator: ${data.calculatorUrl}
- Support: ${data.supportUrl}

Questions? Contact our support team for personalized assistance.

This calculation was generated for ${data.email} on ${data.calculationDate}

Massachusetts Retirement System Calculator
Professional retirement planning for Massachusetts public employees
© 2024 All rights reserved
  `
  
  return { subject, html, text }
}
