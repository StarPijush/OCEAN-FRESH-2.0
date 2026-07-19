import type { Permission } from '@oceanfresh/shared';
import type React from 'react';

import { useRequirePermission } from '../queries/index.js';

interface PermissionGateProps {
  children: React.ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permissions,
  requireAll = true,
  fallback = null,
}: PermissionGateProps) {
  const { data: hasPermission } = useRequirePermission(permissions, requireAll);

  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}
