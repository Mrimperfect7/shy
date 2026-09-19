import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Enables Brotli and Gzip compression for all web pages and assets
  poweredByHeader: false,
  allowedDevOrigins: ['*.preview.emergentagent.com', '*.preview.emergentcf.cloud', 'db490e46-4f47-47b6-9cac-ebd034c9b2ac.cluster-7.preview.emergentcf.cloud', 'db490e46-4f47-47b6-9cac-ebd034c9b2ac.preview.emergentagent.com'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
    optimizePackageImports: ['lucide-react', 'framer-motion', 'react-hot-toast', 'recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'], // Modern lightweight image formats
    minimumCacheTTL: 31536000, // Cache images for 1 year in browser & CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.private.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        port: '',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Allow camera for AI selfie try-on; restrict others
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
