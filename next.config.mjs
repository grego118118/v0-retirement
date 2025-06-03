/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['localhost'],
  },
  // Webpack configuration to handle eval issues in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use cheaper source maps in development
      config.devtool = 'eval-source-map'
    }
    return config
  },
  // Disable some features that might cause CSP issues
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig