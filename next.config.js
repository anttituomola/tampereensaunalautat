/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'http://localhost:3000', 'localhost', 'https://localhost:3000',],
  },
}

module.exports = nextConfig
