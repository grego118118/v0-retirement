/**
 * Password Reset Email Template
 * Sent when users request a password reset
 */

export interface PasswordResetEmailData {
  name: string
  email: string
  resetUrl: string
  expiresIn: string
  supportUrl: string
}

export default function passwordResetTemplate(data: PasswordResetEmailData) {
  const subject = 'Reset Your Massachusetts Retirement Calculator Password'
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
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
        .alert-box {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 4px solid #ef4444;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .alert-icon {
          color: #ef4444;
          font-size: 20px;
          margin-right: 10px;
        }
        .cta-section {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f1f5f9;
          border-radius: 8px;
        }
        .cta-button {
          display: inline-block;
          background-color: #1e40af;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 10px 0;
        }
        .cta-button:hover {
          background-color: #1d4ed8;
        }
        .expiry-notice {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
          text-align: center;
        }
        .security-tips {
          background-color: #f0f9ff;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #0ea5e9;
          margin: 20px 0;
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
        .reset-url {
          word-break: break-all;
          background-color: #f8fafc;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Massachusetts Retirement System</div>
          <div class="subtitle">Password Reset Request</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${data.name},</div>
          
          <p>We received a request to reset the password for your Massachusetts Retirement Calculator account associated with <strong>${data.email}</strong>.</p>
          
          <div class="alert-box">
            <span class="alert-icon">🔒</span>
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
          </div>
          
          <p>To reset your password, click the button below:</p>
          
          <div class="cta-section">
            <a href="${data.resetUrl}" class="cta-button">Reset My Password</a>
            
            <div class="expiry-notice">
              <strong>⏰ This link expires in ${data.expiresIn}</strong><br>
              <small>For your security, this reset link will only work once and expires soon.</small>
            </div>
          </div>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <div class="reset-url">${data.resetUrl}</div>
          
          <div class="security-tips">
            <h3 style="margin-top: 0; color: #0ea5e9;">🛡️ Security Tips for Your New Password:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Use at least 12 characters</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Add numbers and special characters</li>
              <li>Avoid using personal information</li>
              <li>Don't reuse passwords from other accounts</li>
              <li>Consider using a password manager</li>
            </ul>
          </div>
          
          <p>After resetting your password, you'll be able to:</p>
          <ul>
            <li>Access your saved retirement calculations</li>
            <li>Continue using all premium features (if subscribed)</li>
            <li>Manage your account settings and preferences</li>
          </ul>
          
          <p>If you're having trouble resetting your password or have any questions, please don't hesitate to <a href="${data.supportUrl}" style="color: #1e40af;">contact our support team</a>.</p>
        </div>
        
        <div class="footer">
          <p><strong>Important:</strong> This password reset was requested for ${data.email}</p>
          <p>If you didn't request this reset, please contact support immediately.</p>
          
          <p style="margin-top: 20px;">
            <a href="${data.supportUrl}">Support</a> |
            <a href="#">Security Center</a> |
            <a href="#">Privacy Policy</a>
          </p>
          
          <p style="margin-top: 20px;">
            <small>
              Massachusetts Retirement System Calculator<br>
              Secure retirement planning for Massachusetts public employees<br>
              © 2024 All rights reserved
            </small>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
Password Reset Request - Massachusetts Retirement Calculator

Hello ${data.name},

We received a request to reset the password for your account: ${data.email}

SECURITY NOTICE: If you didn't request this password reset, please ignore this email. Your account remains secure.

To reset your password, visit this link:
${data.resetUrl}

This link expires in ${data.expiresIn} for your security.

Security Tips for Your New Password:
• Use at least 12 characters
• Include uppercase and lowercase letters
• Add numbers and special characters
• Avoid using personal information
• Don't reuse passwords from other accounts
• Consider using a password manager

After resetting your password, you'll be able to:
• Access your saved retirement calculations
• Continue using all premium features (if subscribed)
• Manage your account settings and preferences

Need help? Contact our support team: ${data.supportUrl}

IMPORTANT: This password reset was requested for ${data.email}
If you didn't request this reset, please contact support immediately.

Massachusetts Retirement System Calculator
Secure retirement planning for Massachusetts public employees
© 2024 All rights reserved
  `
  
  return { subject, html, text }
}
