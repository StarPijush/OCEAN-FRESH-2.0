import { Role } from '@oceanfresh/shared';
import type React from 'react';

import { useRole } from '../queries/index.js';

interface RoleGateProps {
  children: React.ReactNode;
  requiredRole: Role;
  fallback?: React.ReactNode;
}

const roleLevels: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.CUSTOMER]: 10,
  [Role.MODERATOR]: 50,
  [Role.ADMIN]: 90,
  [Role.SUPER_ADMIN]: 100,
  [Role.SYSTEM]: 999,
};

export function RoleGate({ children, requiredRole, fallback = null }: RoleGateProps) {
  const { data: userRole } = useRole();

  if (!userRole) return <>{fallback}</>;

  const userLevel = roleLevels[userRole as Role] ?? 0;
  const requiredLevel = roleLevels[requiredRole] ?? 0;

  if (userLevel < requiredLevel) return <>{fallback}</>;
  return <>{children}</>;
}
