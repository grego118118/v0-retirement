/**
 * Welcome Email Template
 * Sent to new users after successful registration
 */

export interface WelcomeEmailData {
  name: string
  email: string
  dashboardUrl: string
  calculatorUrl: string
  supportUrl: string
}

export default function welcomeTemplate(data: WelcomeEmailData) {
  const subject = `Welcome to Massachusetts Retirement System Calculator, ${data.name}!`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MA Retirement Calculator</title>
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
        .features {
          background-color: #f1f5f9;
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
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          margin: 0 10px;
          color: #64748b;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Massachusetts Retirement System</div>
          <div class="subtitle">Pension & Benefits Calculator</div>
        </div>
        
        <div class="content">
          <div class="greeting">Welcome, ${data.name}!</div>
          
          <p>Thank you for joining the Massachusetts Retirement System Calculator. We're excited to help you plan for a secure and comfortable retirement.</p>
          
          <p>Your account has been successfully created with the email address: <strong>${data.email}</strong></p>
          
          <div class="features">
            <h3 style="margin-top: 0; color: #1e40af;">What you can do now:</h3>
            <ul class="feature-list">
              <li>Calculate your Massachusetts pension benefits</li>
              <li>Estimate Social Security benefits and optimal claiming strategies</li>
              <li>Analyze tax implications of your retirement income</li>
              <li>Use our step-by-step retirement planning wizard</li>
              <li>Save and track multiple calculation scenarios</li>
              <li>Access Group 3 calculations for public safety employees</li>
            </ul>
          </div>
          
          <div class="cta-section">
            <a href="${data.dashboardUrl}" class="cta-button">Go to Your Dashboard</a>
            <a href="${data.calculatorUrl}" class="cta-button secondary-button">Start Calculating</a>
          </div>
          
          <h3 style="color: #1e40af;">Getting Started Tips:</h3>
          <ol>
            <li><strong>Complete your profile:</strong> Add your employment details for more accurate calculations</li>
            <li><strong>Try the pension calculator:</strong> Get an estimate of your monthly retirement benefits</li>
            <li><strong>Explore Social Security:</strong> See how different claiming strategies affect your income</li>
            <li><strong>Use the wizard:</strong> Get a comprehensive retirement plan in minutes</li>
          </ol>
          
          <p>Need help getting started? Our <a href="${data.supportUrl}" style="color: #1e40af;">support team</a> is here to assist you, or check out our comprehensive FAQ section.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <strong>💡 Pro Tip:</strong> Consider upgrading to Premium for advanced features like PDF reports, detailed tax analysis, and Monte Carlo simulations for retirement planning.
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.email} because you created an account with Massachusetts Retirement System Calculator.</p>
          
          <div class="social-links">
            <a href="#">Privacy Policy</a> |
            <a href="#">Terms of Service</a> |
            <a href="${data.supportUrl}">Support</a>
          </div>
          
          <p style="margin-top: 20px;">
            <small>
              Massachusetts Retirement System Calculator<br>
              Helping Massachusetts public employees plan for retirement<br>
              © 2024 All rights reserved
            </small>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
Welcome to Massachusetts Retirement System Calculator, ${data.name}!

Thank you for joining us. We're excited to help you plan for a secure and comfortable retirement.

Your account has been successfully created with: ${data.email}

What you can do now:
• Calculate your Massachusetts pension benefits
• Estimate Social Security benefits and optimal claiming strategies
• Analyze tax implications of your retirement income
• Use our step-by-step retirement planning wizard
• Save and track multiple calculation scenarios
• Access Group 3 calculations for public safety employees

Getting Started:
1. Complete your profile for more accurate calculations
2. Try the pension calculator to estimate monthly benefits
3. Explore Social Security claiming strategies
4. Use our comprehensive retirement planning wizard

Quick Links:
- Dashboard: ${data.dashboardUrl}
- Calculator: ${data.calculatorUrl}
- Support: ${data.supportUrl}

Need help? Our support team is ready to assist you.

Pro Tip: Consider upgrading to Premium for advanced features like PDF reports, detailed tax analysis, and Monte Carlo simulations.

This email was sent to ${data.email} because you created an account with Massachusetts Retirement System Calculator.

Massachusetts Retirement System Calculator
Helping Massachusetts public employees plan for retirement
© 2024 All rights reserved
  `
  
  return { subject, html, text }
}
