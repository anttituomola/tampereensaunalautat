/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
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