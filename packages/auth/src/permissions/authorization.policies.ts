import { Permission, type PermissionContext } from '@oceanfresh/shared';

import { PermissionResolver } from './permission.resolver.js';

const resolver = new PermissionResolver();

export function canReadProducts(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.PRODUCT_READ);
}

export function canCreateProduct(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.PRODUCT_CREATE);
}

export function canUpdateProduct(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.PRODUCT_UPDATE);
}

export function canDeleteProduct(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.PRODUCT_DELETE);
}

export function canPublishProduct(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.PRODUCT_PUBLISH);
}

export function canManageOrders(context: PermissionContext): Promise<boolean> {
  const p1 = resolver.hasPermission(context, Permission.ORDER_UPDATE);
  const p2 = resolver.hasPermission(context, Permission.ORDER_CANCEL);
  return Promise.resolve(p1 || p2);
}

export function canRefundOrder(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.ORDER_REFUND);
}

export function canManageUsers(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.USER_MANAGE);
}

export function canManageInventory(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.INVENTORY_UPDATE);
}

export function canManagePayments(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.PAYMENT_MANAGE);
}

export function canAccessAdmin(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.ADMIN_ACCESS);
}

export function canManageSettings(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.SETTINGS_UPDATE);
}

export function canManageSystem(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.SYSTEM_MANAGE);
}

export function canImpersonate(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.ADMIN_IMPERSONATE);
}

export function canAssignRoles(context: PermissionContext): Promise<boolean> {
  return resolver.hasPermission(context, Permission.AUTH_ROLE_ASSIGN);
}
