/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['agrovision-image-app.s3.eu-west-1.amazonaws.com'],
    unoptimized: true
  },
  
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif|svg)$/,
      type: 'asset/resource'
    })
    return config
  }
}

module.exports = nextConfig 