# Analytics Setup Guide for Mass Pension

## Google Analytics 4 Setup

### 1. Create Google Analytics Account
1. Go to https://analytics.google.com/
2. Click "Start measuring"
3. Create account name: "Mass Pension"
4. Select "Web" as platform
5. Enter website URL: https://www.masspension.com
6. Choose industry: "Finance & Insurance"
7. Select business size: "Small"

### 2. Install GA4 Tracking Code
The tracking code should already be installed via the Google Analytics component.
Verify installation by checking:
- Page source contains gtag script
- Real-time reports show activity
- Events are being tracked

### 3. Key Events to Track
- **Calculator Usage**: When users complete pension calculations
- **Form Submissions**: Newsletter signups, contact forms
- **Page Views**: Most visited pages
- **User Engagement**: Time on site, bounce rate
- **Conversions**: Premium subscriptions, goal completions

### 4. Custom Events Setup
```javascript
// Calculator completion
gtag('event', 'calculator_completion', {
  'event_category': 'engagement',
  'event_label': 'pension_calculator',
  'retirement_group': 'Group_1' // Dynamic based on user selection
});

// Newsletter signup
gtag('event', 'newsletter_signup', {
  'event_category': 'conversion',
  'event_label': 'homepage_newsletter'
});

// Premium upgrade
gtag('event', 'premium_upgrade', {
  'event_category': 'conversion',
  'event_label': 'subscription',
  'value': 9.99 // Monthly price
});
```

## Google Search Console Setup

### 1. Verify Website Ownership
1. Go to https://search.google.com/search-console/
2. Add property: https://www.masspension.com
3. Verify ownership via:
   - HTML file upload, OR
   - HTML tag in head, OR
   - Google Analytics (if already connected)

### 2. Submit Sitemap
1. Generate sitemap: https://www.masspension.com/sitemap.xml
2. Submit in Search Console under "Sitemaps"
3. Monitor indexing status

### 3. Monitor Key Metrics
- **Search Performance**: Clicks, impressions, CTR, position
- **Coverage**: Indexed pages, errors, warnings
- **Core Web Vitals**: Page experience metrics
- **Mobile Usability**: Mobile-friendly issues

## Key Performance Indicators (KPIs)

### Traffic Metrics
- **Monthly Active Users**: Target 1,000+ by month 3
- **Page Views**: Track calculator and dashboard pages
- **Session Duration**: Aim for 3+ minutes average
- **Bounce Rate**: Target <60% for calculator pages

### Engagement Metrics
- **Calculator Completion Rate**: Target 70%+
- **Return Visitor Rate**: Target 30%+
- **Newsletter Signup Rate**: Target 5% of visitors
- **Premium Conversion Rate**: Target 2-5%

### SEO Metrics
- **Organic Search Traffic**: Track growth month-over-month
- **Keyword Rankings**: Monitor "Massachusetts pension calculator"
- **Backlinks**: Track referring domains
- **Search Impressions**: Monitor in Search Console

### Business Metrics
- **Lead Generation**: Newsletter signups, contact forms
- **Revenue**: Premium subscriptions, affiliate commissions
- **User Retention**: Return calculator usage
- **Customer Acquisition Cost**: Cost per new user

## Tracking Implementation Checklist

### Google Analytics 4
- [ ] Account created and configured
- [ ] Tracking code installed and verified
- [ ] Goals/conversions set up
- [ ] Custom events implemented
- [ ] E-commerce tracking (for premium features)
- [ ] Audience segments created

### Google Search Console
- [ ] Property verified
- [ ] Sitemap submitted
- [ ] Performance monitoring set up
- [ ] Core Web Vitals tracking
- [ ] Mobile usability monitoring

### Additional Tools
- [ ] Google Tag Manager (optional, for advanced tracking)
- [ ] Hotjar or similar (for user behavior analysis)
- [ ] Social media analytics (Facebook, LinkedIn insights)
- [ ] Email marketing analytics (newsletter performance)

## Monthly Reporting Template

### Traffic Report
- Total users and sessions
- Top traffic sources (organic, direct, referral, social)
- Most popular pages
- Geographic distribution (focus on Massachusetts)

### Engagement Report
- Calculator usage statistics
- Newsletter signup conversions
- Premium subscription conversions
- User flow analysis

### SEO Report
- Keyword ranking changes
- Organic traffic growth
- Search Console insights
- Backlink acquisition

### Business Impact Report
- Lead generation numbers
- Revenue from premium features
- User retention metrics
- ROI on marketing efforts

## Alert Setup

### Google Analytics Alerts
- Significant traffic drops (>20% week-over-week)
- Conversion rate drops (>15% week-over-week)
- High bounce rate on key pages (>80%)
- Technical issues (404 errors, site speed issues)

### Search Console Alerts
- Indexing errors
- Manual actions
- Security issues
- Core Web Vitals problems

## Privacy and Compliance

### GDPR/Privacy Considerations
- Cookie consent banner (if targeting EU users)
- Privacy policy updated with analytics disclosure
- Data retention settings configured
- User data anonymization enabled

### Analytics Best Practices
- Regular data audits
- Goal and conversion tracking accuracy
- Cross-device tracking setup
- Attribution model configuration

## Next Steps

1. **Week 1**: Set up Google Analytics 4 and Search Console
2. **Week 2**: Implement custom event tracking
3. **Week 3**: Create reporting dashboards
4. **Week 4**: Set up automated alerts and monitoring
5. **Month 2**: Analyze first month's data and optimize
6. **Ongoing**: Monthly reporting and strategy adjustments

This analytics foundation will provide crucial insights for optimizing your Massachusetts Pension Calculator and measuring the success of your launch strategy.
