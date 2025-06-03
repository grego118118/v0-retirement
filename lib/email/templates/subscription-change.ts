/**
 * Subscription Change Email Template
 * Sent when users upgrade, downgrade, or cancel their subscription
 */

export interface SubscriptionChangeEmailData {
  name: string
  email: string
  changeType: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate'
  oldPlan: string
  newPlan: string
  effectiveDate: string
  amount?: string
  nextBillingDate?: string
  features: string[]
  dashboardUrl: string
  supportUrl: string
  billingUrl: string
}

export default function subscriptionChangeTemplate(data: SubscriptionChangeEmailData) {
  const getSubjectLine = () => {
    switch (data.changeType) {
      case 'upgrade':
        return `Welcome to ${data.newPlan} - Your Subscription Has Been Upgraded!`
      case 'downgrade':
        return `Subscription Updated - Now on ${data.newPlan} Plan`
      case 'cancel':
        return 'Subscription Cancellation Confirmed'
      case 'reactivate':
        return `Welcome Back! Your ${data.newPlan} Subscription is Active`
      default:
        return 'Subscription Update Confirmation'
    }
  }

  const getHeaderMessage = () => {
    switch (data.changeType) {
      case 'upgrade':
        return `🎉 Congratulations on upgrading to ${data.newPlan}!`
      case 'downgrade':
        return `Your subscription has been updated to ${data.newPlan}`
      case 'cancel':
        return 'Your subscription has been cancelled'
      case 'reactivate':
        return `🎉 Welcome back! Your ${data.newPlan} subscription is now active`
      default:
        return 'Subscription update confirmed'
    }
  }

  const getChangeDescription = () => {
    switch (data.changeType) {
      case 'upgrade':
        return `You've successfully upgraded from ${data.oldPlan} to ${data.newPlan}. You now have access to all premium features!`
      case 'downgrade':
        return `Your subscription has been changed from ${data.oldPlan} to ${data.newPlan}. Some features may no longer be available.`
      case 'cancel':
        return `Your ${data.oldPlan} subscription has been cancelled. You'll continue to have access to premium features until ${data.effectiveDate}.`
      case 'reactivate':
        return `Your ${data.newPlan} subscription has been reactivated. Welcome back to all premium features!`
      default:
        return `Your subscription has been updated from ${data.oldPlan} to ${data.newPlan}.`
    }
  }

  const subject = getSubjectLine()
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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
        .change-summary {
          background-color: #f1f5f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #1e40af;
        }
        .upgrade-box {
          background-color: #f0f9ff;
          border-left-color: #10b981;
        }
        .cancel-box {
          background-color: #fef2f2;
          border-left-color: #ef4444;
        }
        .plan-comparison {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
          padding: 15px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .plan-box {
          text-align: center;
          flex: 1;
        }
        .plan-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .old-plan {
          color: #64748b;
          text-decoration: line-through;
        }
        .new-plan {
          color: #10b981;
        }
        .arrow {
          font-size: 24px;
          color: #1e40af;
          margin: 0 20px;
        }
        .features-section {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        .feature-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }
        .billing-info {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
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
          <div class="subtitle">Subscription Update</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${data.name},</div>
          
          <p>${getChangeDescription()}</p>
          
          <div class="change-summary ${data.changeType === 'upgrade' || data.changeType === 'reactivate' ? 'upgrade-box' : data.changeType === 'cancel' ? 'cancel-box' : ''}">
            <h3 style="margin-top: 0; color: #1e40af;">${getHeaderMessage()}</h3>
            
            ${data.changeType !== 'cancel' ? `
              <div class="plan-comparison">
                <div class="plan-box">
                  <div class="plan-name old-plan">${data.oldPlan}</div>
                  <small>Previous Plan</small>
                </div>
                <div class="arrow">→</div>
                <div class="plan-box">
                  <div class="plan-name new-plan">${data.newPlan}</div>
                  <small>Current Plan</small>
                </div>
              </div>
            ` : ''}
            
            <p><strong>Effective Date:</strong> ${data.effectiveDate}</p>
            ${data.amount ? `<p><strong>Amount:</strong> ${data.amount}</p>` : ''}
            ${data.nextBillingDate ? `<p><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>` : ''}
          </div>
          
          ${data.features && data.features.length > 0 ? `
            <div class="features-section">
              <h3 style="margin-top: 0; color: #1e40af;">
                ${data.changeType === 'cancel' ? 'Features Available Until ' + data.effectiveDate : 'Your ' + data.newPlan + ' Features:'}
              </h3>
              <ul class="feature-list">
                ${data.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${data.changeType === 'upgrade' || data.changeType === 'reactivate' ? `
            <div class="billing-info">
              <strong>💡 Getting the Most from Your Premium Subscription:</strong><br>
              • Generate unlimited PDF reports for your retirement calculations<br>
              • Access advanced tax optimization strategies<br>
              • Use Monte Carlo simulations for scenario planning<br>
              • Get priority customer support
            </div>
          ` : ''}
          
          ${data.changeType === 'cancel' ? `
            <div class="billing-info">
              <strong>We're Sorry to See You Go!</strong><br>
              Your premium features will remain active until ${data.effectiveDate}. You can reactivate your subscription anytime before then to avoid losing access.
            </div>
          ` : ''}
          
          <div class="cta-section">
            <a href="${data.dashboardUrl}" class="cta-button">Go to Dashboard</a>
            <a href="${data.billingUrl}" class="cta-button secondary-button">Manage Billing</a>
          </div>
          
          <p>If you have any questions about your subscription or need assistance, please don't hesitate to <a href="${data.supportUrl}" style="color: #1e40af;">contact our support team</a>.</p>
        </div>
        
        <div class="footer">
          <p>This subscription update was processed for ${data.email}</p>
          
          <p style="margin-top: 20px;">
            <a href="${data.billingUrl}">Billing Settings</a> |
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

Hello ${data.name},

${getChangeDescription()}

Change Summary:
- Previous Plan: ${data.oldPlan}
- Current Plan: ${data.newPlan}
- Effective Date: ${data.effectiveDate}
${data.amount ? `- Amount: ${data.amount}` : ''}
${data.nextBillingDate ? `- Next Billing Date: ${data.nextBillingDate}` : ''}

${data.features && data.features.length > 0 ? `
${data.changeType === 'cancel' ? 'Features Available Until ' + data.effectiveDate : 'Your ' + data.newPlan + ' Features'}:
${data.features.map(feature => `• ${feature}`).join('\n')}
` : ''}

Quick Links:
- Dashboard: ${data.dashboardUrl}
- Billing Settings: ${data.billingUrl}
- Support: ${data.supportUrl}

Questions? Contact our support team: ${data.supportUrl}

This subscription update was processed for ${data.email}

Massachusetts Retirement System Calculator
Professional retirement planning for Massachusetts public employees
© 2024 All rights reserved
  `
  
  return { subject, html, text }
}
