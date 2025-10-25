/**
 * System Maintenance Email Template
 * Sent for system updates, maintenance notifications, and announcements
 */

export interface SystemMaintenanceEmailData {
  name: string
  email: string
  notificationType: 'maintenance' | 'update' | 'announcement' | 'outage'
  title: string
  message: string
  scheduledDate?: string
  duration?: string
  affectedServices?: string[]
  alternativeActions?: string[]
  statusPageUrl?: string
  supportUrl: string
  dashboardUrl: string
}

export default function systemMaintenanceTemplate(data: SystemMaintenanceEmailData) {
  const getNotificationIcon = () => {
    switch (data.notificationType) {
      case 'maintenance':
        return '🔧'
      case 'update':
        return '🚀'
      case 'announcement':
        return '📢'
      case 'outage':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = () => {
    switch (data.notificationType) {
      case 'maintenance':
        return '#f59e0b'
      case 'update':
        return '#10b981'
      case 'announcement':
        return '#1e40af'
      case 'outage':
        return '#ef4444'
      default:
        return '#64748b'
    }
  }

  const getSubjectPrefix = () => {
    switch (data.notificationType) {
      case 'maintenance':
        return 'Scheduled Maintenance'
      case 'update':
        return 'System Update'
      case 'announcement':
        return 'Important Announcement'
      case 'outage':
        return 'Service Alert'
      default:
        return 'System Notification'
    }
  }

  const subject = `${getSubjectPrefix()}: ${data.title}`
  
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
        .notification-banner {
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid ${getNotificationColor()};
          background-color: ${data.notificationType === 'outage' ? '#fef2f2' : 
                             data.notificationType === 'maintenance' ? '#fef3c7' :
                             data.notificationType === 'update' ? '#f0fdf4' : '#f1f5f9'};
        }
        .notification-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .notification-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        .notification-title {
          font-size: 20px;
          font-weight: bold;
          color: ${getNotificationColor()};
          margin: 0;
        }
        .notification-type {
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
          margin-top: 5px;
        }
        .schedule-info {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .schedule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        .schedule-item {
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .schedule-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .schedule-value {
          font-weight: 600;
          color: #1e40af;
        }
        .affected-services {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .service-list {
          list-style: none;
          padding: 0;
          margin: 10px 0;
        }
        .service-list li {
          padding: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        .service-list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #f59e0b;
          font-weight: bold;
        }
        .alternative-actions {
          background-color: #f0f9ff;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #0ea5e9;
          margin: 20px 0;
        }
        .action-list {
          list-style: none;
          padding: 0;
          margin: 10px 0;
        }
        .action-list li {
          padding: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        .action-list li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: #0ea5e9;
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
        .status-button {
          background-color: ${getNotificationColor()};
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
          <div class="subtitle">System Notification</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${data.name},</div>
          
          <div class="notification-banner">
            <div class="notification-header">
              <div class="notification-icon">${getNotificationIcon()}</div>
              <div>
                <h2 class="notification-title">${data.title}</h2>
                <div class="notification-type">${getSubjectPrefix()}</div>
              </div>
            </div>
            
            <div class="notification-message">
              ${data.message.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
            </div>
          </div>
          
          ${data.scheduledDate || data.duration ? `
            <div class="schedule-info">
              <h3 style="margin-top: 0; color: #1e40af;">📅 Schedule Information</h3>
              
              <div class="schedule-grid">
                ${data.scheduledDate ? `
                  <div class="schedule-item">
                    <div class="schedule-label">Scheduled Date</div>
                    <div class="schedule-value">${data.scheduledDate}</div>
                  </div>
                ` : ''}
                
                ${data.duration ? `
                  <div class="schedule-item">
                    <div class="schedule-label">Expected Duration</div>
                    <div class="schedule-value">${data.duration}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          ${data.affectedServices && data.affectedServices.length > 0 ? `
            <div class="affected-services">
              <h3 style="margin-top: 0; color: #f59e0b;">⚠️ Affected Services</h3>
              <p>The following services may be temporarily unavailable:</p>
              <ul class="service-list">
                ${data.affectedServices.map(service => `<li>${service}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${data.alternativeActions && data.alternativeActions.length > 0 ? `
            <div class="alternative-actions">
              <h3 style="margin-top: 0; color: #0ea5e9;">💡 What You Can Do</h3>
              <ul class="action-list">
                ${data.alternativeActions.map(action => `<li>${action}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="cta-section">
            ${data.statusPageUrl ? `
              <a href="${data.statusPageUrl}" class="cta-button status-button">Check Status Page</a>
            ` : ''}
            <a href="${data.dashboardUrl}" class="cta-button">Go to Dashboard</a>
            <a href="${data.supportUrl}" class="cta-button secondary-button">Contact Support</a>
          </div>
          
          ${data.notificationType === 'maintenance' ? `
            <p><strong>We apologize for any inconvenience</strong> this maintenance may cause. We're working to improve your experience with the Massachusetts Retirement Calculator.</p>
          ` : ''}
          
          ${data.notificationType === 'update' ? `
            <p><strong>Thank you for using</strong> the Massachusetts Retirement Calculator. We're constantly working to improve our services and provide you with the best retirement planning tools.</p>
          ` : ''}
          
          ${data.notificationType === 'outage' ? `
            <p><strong>We sincerely apologize</strong> for this service disruption. Our team is working diligently to restore full functionality as quickly as possible.</p>
          ` : ''}
          
          <p>If you have any questions or concerns, please don't hesitate to <a href="${data.supportUrl}" style="color: #1e40af;">contact our support team</a>.</p>
        </div>
        
        <div class="footer">
          <p>This notification was sent to ${data.email}</p>
          
          <p style="margin-top: 20px;">
            ${data.statusPageUrl ? `<a href="${data.statusPageUrl}">Status Page</a> |` : ''}
            <a href="${data.dashboardUrl}">Dashboard</a> |
            <a href="${data.supportUrl}">Support</a>
          </p>
          
          <p style="margin-top: 20px;">
            <small>
              Massachusetts Retirement System Calculator<br>
              Keeping you informed about your retirement planning tools<br>
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

${getNotificationIcon()} ${data.title}

${data.message}

${data.scheduledDate ? `Scheduled Date: ${data.scheduledDate}` : ''}
${data.duration ? `Expected Duration: ${data.duration}` : ''}

${data.affectedServices && data.affectedServices.length > 0 ? `
Affected Services:
${data.affectedServices.map(service => `• ${service}`).join('\n')}
` : ''}

${data.alternativeActions && data.alternativeActions.length > 0 ? `
What You Can Do:
${data.alternativeActions.map(action => `→ ${action}`).join('\n')}
` : ''}

Quick Links:
${data.statusPageUrl ? `- Status Page: ${data.statusPageUrl}` : ''}
- Dashboard: ${data.dashboardUrl}
- Support: ${data.supportUrl}

${data.notificationType === 'maintenance' ? 'We apologize for any inconvenience this maintenance may cause.' : ''}
${data.notificationType === 'update' ? 'Thank you for using the Massachusetts Retirement Calculator.' : ''}
${data.notificationType === 'outage' ? 'We sincerely apologize for this service disruption.' : ''}

Questions? Contact our support team: ${data.supportUrl}

This notification was sent to ${data.email}

Massachusetts Retirement System Calculator
Keeping you informed about your retirement planning tools
© 2024 All rights reserved
  `
  
  return { subject, html, text }
}
