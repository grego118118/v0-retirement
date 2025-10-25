/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Configure ES Module support for React-PDF
  // transpilePackages: ['@react-pdf/renderer'], // Commented out to avoid conflict

  // Production optimizations (disabled for development)
  // output: 'standalone',

  // Optimize CSS loading to prevent preload warnings
  experimental: {
    // Disable CSS optimization that requires critters module
    // optimizeCss: true,
    // Use strict CSS chunking to reduce preload warnings
    cssChunking: 'strict',
  },

  // Exclude development routes from production builds
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (!isDevelopment) {
      // In production, redirect dev routes to 404
      return {
        beforeFiles: [
          {
            source: '/dev/:path*',
            destination: '/404',
          },
        ],
        afterFiles: [],
        fallback: [],
      }
    }

    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },

  // Exclude development pages from static generation in production
  async generateBuildId() {
    // Use a consistent build ID for production
    return process.env.NODE_ENV === 'production' ? 'production' : 'development'
  },


  
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
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.app https://va.vercel-scripts.com https://vitals.vercel-insights.com https://vitals.vercel-analytics.com https://apis.google.com https://accounts.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://partner.googleadservices.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob: https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.vercel.app https://*.supabase.co wss://*.vercel.app https://vercel.live wss://vercel.live https://vitals.vercel-insights.com https://vitals.vercel-analytics.com https://apis.google.com https://accounts.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://tpc.googlesyndication.com https://partner.googleadservices.com; frame-src 'self' https://vercel.live https://accounts.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; worker-src 'self' blob:; object-src 'none';"
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // TypeScript configuration for production builds
  typescript: {
    // In production, use production-specific TypeScript config that excludes dev files
    ...(process.env.NODE_ENV === 'production' && {
      ignoreBuildErrors: false, // Keep strict validation for production files
      tsconfigPath: './tsconfig.production.json'
    })
  },

  // Webpack configuration for production builds
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configure React-PDF ES Module handling
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    }

    // Handle React-PDF ES modules - don't externalize for server
    // Let webpack bundle it properly instead
    if (isServer) {
      // Ensure React-PDF is bundled with the server
      config.externals = config.externals || []
      // Remove any existing externalization of react-pdf
      config.externals = config.externals.filter(external => {
        if (typeof external === 'string') {
          return !external.includes('@react-pdf')
        }
        if (typeof external === 'object') {
          return !('@react-pdf/renderer' in external)
        }
        return true
      })

      // Add fallbacks for Node.js modules that React-PDF might need
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      }
    }

    // Only apply minimal changes in production
    if (!dev && process.env.NODE_ENV === 'production') {
      // Use production stub for wizard-v2-dev component if needed
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components/wizard/wizard-v2-dev': require.resolve('./components/wizard/wizard-v2-dev.production.tsx'),
      }
    }

    return config
  },
  
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
