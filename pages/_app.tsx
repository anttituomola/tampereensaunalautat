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

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setLoading(true);
      }
    };
    const handleComplete = () => setLoading(false);
    const handleError = (error: Error, url: string) => {
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
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

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
