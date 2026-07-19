import {
  type ABACEngine,
  createLogger,
  type Permission,
  type PermissionContext,
  type Role,
} from '@oceanfresh/shared';

import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from './permission-matrix.js';

const logger = createLogger('auth:permission:resolver');

export class PermissionResolver {
  private abacEngines: ABACEngine[] = [];

  registerABACEngine(engine: ABACEngine): void {
    this.abacEngines.push(engine);
  }

  async hasPermission(context: PermissionContext, permission: Permission): Promise<boolean> {
    logger.debug('hasPermission', { userId: context.userId, permission });

    if (!this.rbacHasPermission(context.userRole, permission)) {
      return false;
    }

    for (const engine of this.abacEngines) {
      if (!(await engine.evaluate(context, permission))) {
        return false;
      }
    }

    return true;
  }

  getEffectivePermissions(role: Role): Permission[] {
    const roleDef = ROLE_PERMISSIONS.find((r) => r.role === role);
    if (!roleDef) return [];

    const permissions = new Set<Permission>();

    for (const inheritedRole of roleDef.inherits) {
      const inheritedPerms = this.getEffectivePermissions(inheritedRole);
      for (const p of inheritedPerms) {
        permissions.add(p);
      }
    }

    for (const p of roleDef.permissions) {
      permissions.add(p);
    }

    return Array.from(permissions);
  }

  rbacHasPermission(role: Role, permission: Permission): boolean {
    const effective = this.getEffectivePermissions(role);
    return effective.includes(permission);
  }

  isAtLeastRole(userRole: Role, minimumRole: Role): boolean {
    const userLevel = ROLE_HIERARCHY[userRole]?.level ?? 0;
    const minLevel = ROLE_HIERARCHY[minimumRole]?.level ?? 0;
    return userLevel >= minLevel;
  }

  getRoleLevel(role: Role): number {
    return ROLE_HIERARCHY[role]?.level ?? 0;
  }
}
