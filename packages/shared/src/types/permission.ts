export enum Permission {
  PRODUCT_READ = 'product:read',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_PUBLISH = 'product:publish',
  CATEGORY_READ = 'category:read',
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  CATEGORY_MOVE = 'category:move',
  ORDER_READ = 'order:read',
  ORDER_CREATE = 'order:create',
  ORDER_UPDATE = 'order:update',
  ORDER_CANCEL = 'order:cancel',
  ORDER_REFUND = 'order:refund',
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE = 'user:manage',
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_ADJUST = 'inventory:adjust',
  PAYMENT_READ = 'payment:read',
  PAYMENT_REFUND = 'payment:refund',
  PAYMENT_MANAGE = 'payment:manage',
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',
  ADMIN_ACCESS = 'admin:access',
  ADMIN_IMPERSONATE = 'admin:impersonate',
  SYSTEM_MANAGE = 'system:manage',
  SYSTEM_CONFIGURE = 'system:configure',
  AUTH_ROLE_ASSIGN = 'auth:role_assign',
  AUTH_PERMISSION_GRANT = 'auth:permission_grant',
  AUTH_SESSION_REVOKE = 'auth:session_revoke',
  AUTH_MFA_ADMIN = 'auth:mfa_admin',
  AUTH_ELEVATE = 'auth:elevate',
  AUDIT_READ = 'audit:read',
  AUDIT_EXPORT = 'audit:export',
  CART_READ = 'cart:read',
  CART_CREATE = 'cart:create',
  CART_UPDATE = 'cart:update',
  CART_DELETE = 'cart:delete',
  CART_MERGE = 'cart:merge',
  CART_CHECKOUT = 'cart:checkout',
  CART_ADMIN = 'cart:admin',
}

export enum Role {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM = 'system',
}

export interface PermissionOverride {
  permission: Permission;
  effect: 'ALLOW' | 'DENY';
}

export interface RolePermissions {
  role: Role;
  level: number;
  inherits: Role[];
  permissions: Permission[];
  overrides?: PermissionOverride[];
}

export interface PermissionMatrix {
  roles: RolePermissions[];
  getPermissionsForRole(role: Role): Permission[];
  getEffectivePermissions(role: Role, overrides?: PermissionOverride[]): Permission[];
  roleHasPermission(role: Role, permission: Permission): boolean;
  isAtLeastRole(userRole: Role, minimumRole: Role): boolean;
}

export interface AuthorizationPolicy {
  name: string;
  description: string;
  check: string;
}

export interface PermissionContext {
  userId: string;
  userRole: Role;
  resource?: {
    type: string;
    id: string;
    ownerId?: string;
    data?: Record<string, unknown>;
  };
  environment?: {
    ip: string;
    deviceId: string;
    timestamp: number;
  };
  action: string;
}

export interface ABACEngine {
  name: string;
  evaluate(context: PermissionContext, permission: Permission): Promise<boolean>;
}

export interface Claims {
  role: Role;
  permissions: string[];
  tokenVersion: number;
  mfaEnrolled: boolean;
  mfaVerified: boolean;
  elevation?: {
    originalRole: Role;
    expiresAt: number;
  };
  impersonating?: string;
}
