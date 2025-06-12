/**
 * Massachusetts Retirement System - Lighthouse CI Configuration
 * 
 * Performance testing configuration for production deployment validation.
 * Ensures sub-2-second performance requirements are met across all pages.
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/calculator',
        'http://localhost:3000/scenarios',
        'http://localhost:3000/social-security',
        'http://localhost:3000/tax-calculator',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/profile',
        'http://localhost:3000/wizard'
      ],
      
      // Collection settings
      numberOfRuns: 3,
      settings: {
        // Emulate mobile device for responsive testing
        emulatedFormFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        
        // Skip certain audits that aren't relevant
        skipAudits: [
          'canonical',
          'uses-http2',
          'redirects-http'
        ],
        
        // Chrome flags for testing
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless'
        ]
      }
    },
    
    assert: {
      // Performance assertions (sub-2-second requirement)
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Additional performance metrics
        'speed-index': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 2000 }],
        'server-response-time': ['error', { maxNumericValue: 600 }],
        
        // Accessibility requirements (WCAG 2.1 AA)
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'meta-viewport': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        
        // SEO requirements
        'document-title': 'error',
        'meta-description': 'error',
        'http-status-code': 'error',
        'crawlable-anchors': 'error'
      }
    },
    
    upload: {
      target: 'temporary-public-storage'
    },
    
    server: {
      port: 9001,
      storage: './lighthouse-reports'
    }
  }
}
