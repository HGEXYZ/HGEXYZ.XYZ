/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'osirisai.live',
      },
    ],
  },
}

module.exports = nextConfig
