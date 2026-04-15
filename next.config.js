/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Turbopack (default in Next.js 16+), we don't need special config
  // The date-fns issue is fixed with version 4.x
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig