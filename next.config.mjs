/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for better debugging
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during builds
  },
  images: {
    unoptimized: true, // Disable image optimization for simpler setups
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Proxy API requests
        destination: "http://localhost:8000/:path*", // Python backend URL
      },
    ]
  },
}

export default nextConfig
