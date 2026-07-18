import type React from 'react';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
}

export function FeatureGate({ children, feature, fallback = null }: FeatureGateProps) {
  const isEnabled = true;
  if (!isEnabled) return <>{fallback}</>;
  return <>{children}</>;
}
