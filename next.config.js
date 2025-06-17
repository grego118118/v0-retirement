/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'puppeteer'],

  // Production optimizations
  output: 'standalone',


  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack configuration temporarily disabled for debugging
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   return config
  // },
  
  // Additional configuration can be added here
}

// Sentry webpack plugin configuration (temporarily disabled to resolve build issues)
// TODO: Re-enable once Sentry package compatibility is resolved
/*
const { withSentryConfig } = require('@sentry/nextjs')

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: process.env.NODE_ENV === 'production',
  widenClientFileUpload: true,
}

module.exports = process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
*/

// Temporarily export nextConfig directly without Sentry
module.exports = nextConfig
