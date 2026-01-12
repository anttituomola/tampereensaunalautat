import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from 'components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../styles/theme';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LoadingOverlay from 'components/LoadingOverlay';
import { AuthProvider } from '../contexts/AuthContext';
import * as Sentry from '@sentry/nextjs';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Set up global error handlers once on mount
  useEffect(() => {
    // Handle unhandled promise rejections (e.g., TrackerStorageType errors from third-party scripts)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage =
        error?.message || error?.toString() || 'Unknown error';
      const errorStack = (error as Error)?.stack || '';

      // Suppress TrackerStorageType errors from third-party scripts (e.g., Iubenda cookie consent)
      // Use case-insensitive matching to match instrumentation-client.ts behavior
      if (
        /TrackerStorageType/i.test(errorMessage) ||
        /TrackerStorageType/i.test(errorStack)
      ) {
        event.preventDefault();
        // Silently ignore these errors as they're from third-party scripts
        // and don't affect the application functionality
        return;
      }
      // For all other errors, let them propagate to other handlers (e.g., instrumentation-client.ts)
      // which will capture them to Sentry appropriately
    };

    // Handle general errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      const errorStack = event.error?.stack || '';

      // Suppress TrackerStorageType errors
      // Use case-insensitive matching to match instrumentation-client.ts behavior
      if (
        /TrackerStorageType/i.test(errorMessage) ||
        /TrackerStorageType/i.test(errorStack)
      ) {
        event.preventDefault();
        return;
      }
      // For all other errors, let them propagate to other handlers (e.g., instrumentation-client.ts)
      // which will capture them to Sentry appropriately
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []); // Empty dependency array - only set up once on mount

  // Set up router event handlers
  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setLoading(true);
      }
    };
    const handleComplete = () => setLoading(false);
    const handleRouteError = (error: Error, url: string) => {
      setLoading(false);
      console.warn('Route change error:', error.message, {
        url,
        currentPath: router.asPath,
      });

      // Only capture route cancellation errors if they're not expected
      if (
        error.message !== 'Route Cancelled' ||
        process.env.NODE_ENV === 'development'
      ) {
        Sentry.captureException(error, {
          tags: { section: 'navigation' },
          extra: {
            url,
            currentPath: router.asPath,
            errorMessage: error.message,
            timestamp: new Date().toISOString(),
          },
        });
      }
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router]); // Router dependency - handlers need access to router state

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Layout>
            {loading && <LoadingOverlay />}
            <Component {...pageProps} />
            <ToastContainer />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
