/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimisations de performance (swcMinify est activé par défaut dans Next.js 15)
  compress: true,
  poweredByHeader: false,
  // Optimiser les images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig




