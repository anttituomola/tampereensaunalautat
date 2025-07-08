import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from './LoadingOverlay';
import { ProtectedRouteProps } from '../types';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination
      const returnUrl = router.asPath;
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingOverlay />;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return <LoadingOverlay />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
