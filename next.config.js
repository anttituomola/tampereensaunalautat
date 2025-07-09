/** @type {import('next').NextConfig} */
const nextConfig = {
	// Temporarily disable StrictMode in development due to react-beautiful-dnd compatibility issues
	// StrictMode causes double-invocation of effects which breaks react-beautiful-dnd's internal state
	reactStrictMode: process.env.NODE_ENV === 'production',
	images: {
		unoptimized: false, // Enable image optimization
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 31536000, // 1 year cache
		dangerouslyAllowSVG: false,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.tampereensaunalautat.fi',
				port: '',
				pathname: '/images/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '3001',
				pathname: '/images/**',
			},
		],
	},
	// Enable compression
	compress: true,
	// Optimize for production
	poweredByHeader: false,
	generateEtags: true,
	// Improve caching
	onDemandEntries: {
		maxInactiveAge: 25 * 1000,
		pagesBufferLength: 2,
	},
}

module.exports = nextConfig