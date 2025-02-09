/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['agrovision-image-app.s3.eu-west-1.amazonaws.com'],
  },
  env: {
    AWS_REGION: process.env.NEXT_PUBLIC_REGION,
    AWS_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY: process.env.NEXT_PUBLIC_SECRET_KEY,
    S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET,
    DYNAMODB_TABLE_NAME: process.env.NEXT_PUBLIC_DYNAMODB_TABLE,
    MODEL_ARN: process.env.NEXT_PUBLIC_MODEL_ARN,
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