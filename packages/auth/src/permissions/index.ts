export { PermissionResolver } from './permission.resolver.js';
export { ROLE_PERMISSIONS, ROLE_HIERARCHY } from './permission-matrix.js';
export {
  canReadProducts,
  canCreateProduct,
  canUpdateProduct,
  canDeleteProduct,
  canPublishProduct,
  canManageOrders,
  canRefundOrder,
  canManageUsers,
  canManageInventory,
  canManagePayments,
  canAccessAdmin,
  canManageSettings,
  canManageSystem,
  canImpersonate,
  canAssignRoles,
} from './authorization.policies.js';
