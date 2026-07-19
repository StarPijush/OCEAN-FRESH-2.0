import type React from 'react';

import { useIsAuthenticated } from '../queries/index.js';

interface ProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function Protected({ children, fallback = null, loadingFallback = null }: ProtectedProps) {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) return <>{loadingFallback}</>;
  if (!isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
}
