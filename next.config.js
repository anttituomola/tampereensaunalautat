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
				hostname: process.env.NEXT_PUBLIC_API_HOSTNAME || 'api.tampereensaunalautat.fi',
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

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "antti-tuomola",
    project: "tampereensaunalautat",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
