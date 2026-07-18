import type React from 'react';
import { useIsAuthenticated } from '../queries/index.js';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback = null, loadingFallback = null }: AuthGuardProps) {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) return <>{loadingFallback}</>;
  if (!isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
}
