import type React from 'react';
import { Role } from '@oceanfresh/shared';
import { useRole } from '../queries/index.js';

interface RoleGateProps {
  children: React.ReactNode;
  requiredRole: Role;
  fallback?: React.ReactNode;
}

export function RoleGate({ children, requiredRole, fallback = null }: RoleGateProps) {
  const { data: userRole } = useRole();
  if (!userRole) return <>{fallback}</>;

  const hierarchy: Record<Role, number> = {
    [Role.GUEST]: 0,
    [Role.CUSTOMER]: 10,
    [Role.MODERATOR]: 50,
    [Role.ADMIN]: 90,
    [Role.SUPER_ADMIN]: 100,
    [Role.SYSTEM]: 999,
  };

  const userLevel = hierarchy[userRole as Role] ?? 0;
  const requiredLevel = hierarchy[requiredRole] ?? 0;

  if (userLevel < requiredLevel) return <>{fallback}</>;
  return <>{children}</>;
}
