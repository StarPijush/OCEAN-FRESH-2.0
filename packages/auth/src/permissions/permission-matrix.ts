import { Permission, Role, type RolePermissions } from '@oceanfresh/shared';

const GUEST_PERMISSIONS: Permission[] = [Permission.PRODUCT_READ, Permission.CATEGORY_READ];

const CUSTOMER_PERMISSIONS: Permission[] = [
  ...GUEST_PERMISSIONS,
  Permission.ORDER_CREATE,
  Permission.ORDER_READ,
  Permission.USER_UPDATE,
];

const MODERATOR_PERMISSIONS: Permission[] = [
  ...CUSTOMER_PERMISSIONS,
  Permission.PRODUCT_CREATE,
  Permission.PRODUCT_UPDATE,
  Permission.CATEGORY_CREATE,
  Permission.CATEGORY_UPDATE,
  Permission.CATEGORY_MOVE,
  Permission.INVENTORY_READ,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MODERATOR_PERMISSIONS,
  Permission.PRODUCT_DELETE,
  Permission.PRODUCT_PUBLISH,
  Permission.CATEGORY_DELETE,
  Permission.ORDER_UPDATE,
  Permission.ORDER_CANCEL,
  Permission.ORDER_REFUND,
  Permission.USER_READ,
  Permission.USER_MANAGE,
  Permission.SETTINGS_READ,
  Permission.ANALYTICS_READ,
  Permission.ADMIN_ACCESS,
  Permission.AUDIT_READ,
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.USER_CREATE,
  Permission.USER_DELETE,
  Permission.SETTINGS_UPDATE,
  Permission.ANALYTICS_EXPORT,
  Permission.ADMIN_IMPERSONATE,
  Permission.SYSTEM_MANAGE,
  Permission.AUTH_ROLE_ASSIGN,
  Permission.AUTH_PERMISSION_GRANT,
  Permission.AUTH_SESSION_REVOKE,
  Permission.AUTH_MFA_ADMIN,
  Permission.AUTH_ELEVATE,
  Permission.AUDIT_EXPORT,
];

const SYSTEM_PERMISSIONS: Permission[] = Object.values(Permission);

export const ROLE_PERMISSIONS: RolePermissions[] = [
  { role: Role.GUEST, level: 0, inherits: [], permissions: GUEST_PERMISSIONS },
  { role: Role.CUSTOMER, level: 10, inherits: [Role.GUEST], permissions: CUSTOMER_PERMISSIONS },
  {
    role: Role.MODERATOR,
    level: 50,
    inherits: [Role.CUSTOMER],
    permissions: MODERATOR_PERMISSIONS,
  },
  { role: Role.ADMIN, level: 90, inherits: [Role.MODERATOR], permissions: ADMIN_PERMISSIONS },
  {
    role: Role.SUPER_ADMIN,
    level: 100,
    inherits: [Role.ADMIN],
    permissions: SUPER_ADMIN_PERMISSIONS,
  },
  { role: Role.SYSTEM, level: 999, inherits: [Role.SUPER_ADMIN], permissions: SYSTEM_PERMISSIONS },
];

export const ROLE_HIERARCHY: Record<Role, { level: number; inherits: Role[] }> = {
  [Role.GUEST]: { level: 0, inherits: [] },
  [Role.CUSTOMER]: { level: 10, inherits: [Role.GUEST] },
  [Role.MODERATOR]: { level: 50, inherits: [Role.CUSTOMER] },
  [Role.ADMIN]: { level: 90, inherits: [Role.MODERATOR] },
  [Role.SUPER_ADMIN]: { level: 100, inherits: [Role.ADMIN] },
  [Role.SYSTEM]: { level: 999, inherits: [Role.SUPER_ADMIN] },
};
