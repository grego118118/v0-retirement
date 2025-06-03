/**
 * PDF Share Email Template
 * Sent when users share their retirement calculation PDFs
 */

export interface PDFShareEmailData {
  senderName: string
  senderEmail: string
  recipientName?: string
  message?: string
  reportType: 'pension' | 'tax' | 'wizard' | 'combined'
  reportTitle: string
  generatedDate: string
  calculatorUrl: string
  supportUrl: string
}

export default function pdfShareTemplate(data: PDFShareEmailData) {
  const getReportTypeLabel = () => {
    switch (data.reportType) {
      case 'pension':
        return 'Pension Calculation Report'
      case 'tax':
        return 'Tax Implications Report'
      case 'wizard':
        return 'Retirement Planning Report'
      case 'combined':
        return 'Comprehensive Retirement Report'
      default:
        return 'Retirement Report'
    }
  }

  const subject = `${data.senderName} shared a ${getReportTypeLabel()} with you`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shared Retirement Report</title>
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
        .share-info {
          background-color: #f1f5f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #1e40af;
        }
        .sender-info {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .sender-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #1e40af;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
        }
        .sender-details h4 {
          margin: 0;
          color: #1e40af;
        }
        .sender-details p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .personal-message {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
          font-style: italic;
        }
        .report-details {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .report-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        .meta-item {
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .meta-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .meta-value {
          font-weight: 600;
          color: #1e40af;
        }
        .attachment-notice {
          background-color: #f0f9ff;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #0ea5e9;
          margin: 20px 0;
          text-align: center;
        }
        .attachment-icon {
          font-size: 24px;
          margin-bottom: 10px;
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
        .disclaimer {
          background-color: #f1f5f9;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 14px;
          color: #64748b;
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
          <div class="subtitle">Shared Retirement Report</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            ${data.recipientName ? `Hello ${data.recipientName},` : 'Hello,'}
          </div>
          
          <p><strong>${data.senderName}</strong> has shared a retirement planning report with you using the Massachusetts Retirement System Calculator.</p>
          
          <div class="share-info">
            <div class="sender-info">
              <div class="sender-avatar">
                ${data.senderName.charAt(0).toUpperCase()}
              </div>
              <div class="sender-details">
                <h4>${data.senderName}</h4>
                <p>${data.senderEmail}</p>
              </div>
            </div>
            
            ${data.message ? `
              <div class="personal-message">
                <strong>Personal Message:</strong><br>
                "${data.message}"
              </div>
            ` : ''}
          </div>
          
          <div class="report-details">
            <h3 style="margin-top: 0; color: #1e40af;">📊 Report Details</h3>
            <p><strong>Report Type:</strong> ${getReportTypeLabel()}</p>
            <p><strong>Title:</strong> ${data.reportTitle}</p>
            
            <div class="report-meta">
              <div class="meta-item">
                <div class="meta-label">Generated Date</div>
                <div class="meta-value">${data.generatedDate}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Report Type</div>
                <div class="meta-value">${getReportTypeLabel()}</div>
              </div>
            </div>
          </div>
          
          <div class="attachment-notice">
            <div class="attachment-icon">📎</div>
            <strong>PDF Report Attached</strong><br>
            <small>The detailed retirement report is attached to this email as a PDF file.</small>
          </div>
          
          <div class="cta-section">
            <a href="${data.calculatorUrl}" class="cta-button">Try the Calculator Yourself</a>
            <a href="${data.supportUrl}" class="cta-button secondary-button">Learn More</a>
          </div>
          
          <h3 style="color: #1e40af;">About This Report</h3>
          <p>This report was generated using the Massachusetts Retirement System Calculator, a professional tool designed to help Massachusetts public employees plan for retirement.</p>
          
          ${data.reportType === 'pension' ? `
            <p><strong>Pension Report:</strong> This report contains estimated pension benefits based on Massachusetts Retirement System rules, including monthly and annual benefit calculations, retirement options, and survivor benefits.</p>
          ` : ''}
          
          ${data.reportType === 'tax' ? `
            <p><strong>Tax Report:</strong> This report analyzes the tax implications of retirement income, including federal and Massachusetts state taxes, Social Security taxability, and optimization strategies.</p>
          ` : ''}
          
          ${data.reportType === 'wizard' ? `
            <p><strong>Retirement Planning Report:</strong> This comprehensive report includes pension calculations, Social Security analysis, and personalized retirement planning recommendations.</p>
          ` : ''}
          
          ${data.reportType === 'combined' ? `
            <p><strong>Comprehensive Report:</strong> This detailed report includes complete pension and Social Security analysis, tax implications, and comprehensive retirement planning strategies.</p>
          ` : ''}
          
          <div class="disclaimer">
            <strong>Important Disclaimer:</strong> This report contains estimates based on current laws and the information provided. Actual benefits may vary. For official benefit calculations, please consult with the Massachusetts State Retirement Board or a qualified financial advisor.
          </div>
          
          <p>Interested in creating your own retirement plan? Visit our calculator to get started with your personalized retirement analysis.</p>
        </div>
        
        <div class="footer">
          <p>This report was shared with you by ${data.senderName} (${data.senderEmail})</p>
          
          <p style="margin-top: 20px;">
            <a href="${data.calculatorUrl}">Massachusetts Retirement Calculator</a> |
            <a href="${data.supportUrl}">Support</a> |
            <a href="#">Privacy Policy</a>
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

${data.recipientName ? `Hello ${data.recipientName},` : 'Hello,'}

${data.senderName} has shared a retirement planning report with you using the Massachusetts Retirement System Calculator.

Shared by: ${data.senderName} (${data.senderEmail})

${data.message ? `Personal Message: "${data.message}"` : ''}

Report Details:
- Type: ${getReportTypeLabel()}
- Title: ${data.reportTitle}
- Generated: ${data.generatedDate}

The detailed retirement report is attached to this email as a PDF file.

About This Report:
This report was generated using the Massachusetts Retirement System Calculator, a professional tool designed to help Massachusetts public employees plan for retirement.

${data.reportType === 'pension' ? 'This pension report contains estimated benefits based on Massachusetts Retirement System rules.' : ''}
${data.reportType === 'tax' ? 'This tax report analyzes the tax implications of retirement income.' : ''}
${data.reportType === 'wizard' ? 'This comprehensive report includes pension calculations and retirement planning recommendations.' : ''}
${data.reportType === 'combined' ? 'This detailed report includes complete pension, Social Security, and tax analysis.' : ''}

Try the Calculator: ${data.calculatorUrl}
Support: ${data.supportUrl}

IMPORTANT DISCLAIMER: This report contains estimates based on current laws and the information provided. Actual benefits may vary. For official benefit calculations, please consult with the Massachusetts State Retirement Board.

This report was shared with you by ${data.senderName} (${data.senderEmail})

Massachusetts Retirement System Calculator
Professional retirement planning for Massachusetts public employees
© 2024 All rights reserved
  `
  
  return { subject, html, text }
}
