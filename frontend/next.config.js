/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }]
  },
  async rewrites() {
    if (process.env.VERCEL) return []
    return [
      { source: "/api/:path*", destination: "http://localhost:8000/api/v1/:path*" },
      { source: "/ws/:path*", destination: "http://localhost:8000/ws/:path*" }
    ]
  },
  output: "standalone",
  distDir: ".next"
}
module.exports = nextConfig
