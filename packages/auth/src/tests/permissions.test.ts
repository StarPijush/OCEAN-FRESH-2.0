import { Permission, Role } from '@oceanfresh/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { PermissionResolver } from '../permissions/permission.resolver.js';

describe('PermissionResolver', () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    resolver = new PermissionResolver();
  });

  it('grants GUEST the product:read permission', () => {
    expect(resolver.rbacHasPermission(Role.GUEST, Permission.PRODUCT_READ)).toBe(true);
  });

  it('denies GUEST the product:create permission', () => {
    expect(resolver.rbacHasPermission(Role.GUEST, Permission.PRODUCT_CREATE)).toBe(false);
  });

  it('grants CUSTOMER all GUEST permissions plus own', () => {
    expect(resolver.rbacHasPermission(Role.CUSTOMER, Permission.PRODUCT_READ)).toBe(true);
    expect(resolver.rbacHasPermission(Role.CUSTOMER, Permission.ORDER_CREATE)).toBe(true);
  });

  it('denies CUSTOMER admin permissions', () => {
    expect(resolver.rbacHasPermission(Role.CUSTOMER, Permission.USER_MANAGE)).toBe(false);
    expect(resolver.rbacHasPermission(Role.CUSTOMER, Permission.ADMIN_ACCESS)).toBe(false);
  });

  it('grants MODERATOR product:create', () => {
    expect(resolver.rbacHasPermission(Role.MODERATOR, Permission.PRODUCT_CREATE)).toBe(true);
  });

  it('denies MODERATOR user management', () => {
    expect(resolver.rbacHasPermission(Role.MODERATOR, Permission.USER_MANAGE)).toBe(false);
  });

  it('grants ADMIN user management', () => {
    expect(resolver.rbacHasPermission(Role.ADMIN, Permission.USER_MANAGE)).toBe(true);
    expect(resolver.rbacHasPermission(Role.ADMIN, Permission.ADMIN_ACCESS)).toBe(true);
  });

  it('denies ADMIN system:manage', () => {
    expect(resolver.rbacHasPermission(Role.ADMIN, Permission.SYSTEM_MANAGE)).toBe(false);
  });

  it('grants SUPER_ADMIN all permissions including SYSTEM', () => {
    expect(resolver.rbacHasPermission(Role.SUPER_ADMIN, Permission.SYSTEM_MANAGE)).toBe(true);
    expect(resolver.rbacHasPermission(Role.SUPER_ADMIN, Permission.AUTH_ROLE_ASSIGN)).toBe(true);
  });

  it('grants SYSTEM role all permissions', () => {
    expect(resolver.rbacHasPermission(Role.SYSTEM, Permission.SYSTEM_MANAGE)).toBe(true);
    expect(resolver.rbacHasPermission(Role.SYSTEM, Permission.PRODUCT_READ)).toBe(true);
  });

  it('getEffectivePermissions returns permissions for a role', () => {
    const perms = resolver.getEffectivePermissions(Role.GUEST);
    expect(perms.length).toBeGreaterThanOrEqual(2);
  });

  it('isAtLeastRole checks hierarchy', () => {
    expect(resolver.isAtLeastRole(Role.ADMIN, Role.MODERATOR)).toBe(true);
    expect(resolver.isAtLeastRole(Role.MODERATOR, Role.ADMIN)).toBe(false);
    expect(resolver.isAtLeastRole(Role.ADMIN, Role.ADMIN)).toBe(true);
  });

  it('hasPermission returns false for unknown role via rbacHasPermission', () => {
    expect(resolver.rbacHasPermission('UNKNOWN' as Role, Permission.ADMIN_ACCESS)).toBe(false);
  });

  it('getEffectivePermissions returns empty for unknown role', () => {
    expect(resolver.getEffectivePermissions('UNKNOWN' as Role)).toEqual([]);
  });
});
