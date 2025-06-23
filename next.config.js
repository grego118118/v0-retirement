/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'puppeteer'],

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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.app https://va.vercel-scripts.com https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.vercel.app https://*.supabase.co wss://*.vercel.app https://vercel.live wss://vercel.live https://apis.google.com https://accounts.google.com; frame-src 'self' https://vercel.live https://accounts.google.com; worker-src 'self' blob:; object-src 'none';"
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

  // Webpack configuration to exclude dev routes in production
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude development files from production builds
    if (!dev && process.env.NODE_ENV === 'production') {
      // Ignore development files completely
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/dev\/.*$/,
          contextRegExp: /app$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /wizard-v2-dev\.tsx$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /wizard-navigation-v2\.tsx$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /essential-information-step\.tsx$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /enhanced-calculation-preview\.tsx$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /live-calculation-preview\.tsx$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /wizard-test-helper\.tsx$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /wizard-types-v2\.ts$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /smart-defaults\.ts$/,
        })
      )

      // Also exclude from module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components/wizard/wizard-v2-dev': false,
        '@/components/wizard/wizard-navigation-v2': false,
        '@/components/wizard/essential-information-step': false,
        '@/components/wizard/enhanced-calculation-preview': false,
        '@/components/wizard/live-calculation-preview': false,
        '@/components/wizard/wizard-test-helper': false,
        '@/lib/wizard/wizard-types-v2': false,
        '@/lib/wizard/smart-defaults': false,
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
