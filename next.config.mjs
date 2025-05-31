/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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