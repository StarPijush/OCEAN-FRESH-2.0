import {
  AuthEventType,
  AuthorizationError,
  createLogger,
  Permission,
  type PermissionContext,
  Role,
  type UserIdentity,
} from '@oceanfresh/shared';

import type { EventBus } from '../events/index.js';
import type { PermissionResolver } from '../permissions/index.js';
import type { IAuthRepository } from '../repository/index.js';
import type { ICloudFunctionsRepository } from './cloud-functions.repository.js';

const logger = createLogger('auth:service:authorization');

export class AuthorizationService {
  constructor(
    private readonly resolver: PermissionResolver,
    private readonly authRepository: IAuthRepository,
    private readonly cloudFunctions: ICloudFunctionsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async hasPermission(
    user: UserIdentity,
    permission: Permission,
    resource?: PermissionContext['resource'],
  ): Promise<boolean> {
    const context: PermissionContext = {
      userId: user.id,
      userRole: user.identityType === 'service_account' ? Role.SYSTEM : Role.CUSTOMER,
      resource,
      action: permission,
    };
    return this.resolver.hasPermission(context, permission);
  }

  async requirePermission(
    user: UserIdentity,
    permission: Permission,
    resource?: PermissionContext['resource'],
  ): Promise<void> {
    const has = await this.hasPermission(user, permission, resource);
    if (!has) {
      throw new AuthorizationError(`Missing required permission: ${permission}`);
    }
  }

  async assignRole(actor: UserIdentity, targetUid: string, role: Role): Promise<void> {
    logger.info('assignRole', { actorId: actor.id, targetUid, role });
    await this.requirePermission(actor, Permission.AUTH_ROLE_ASSIGN);
    await this.cloudFunctions.assignRole(targetUid, role);
    await this.eventBus.publish({
      type: AuthEventType.ROLE_CHANGED,
      userId: targetUid,
      data: { role, assignedBy: actor.id },
      metadata: { source: 'AuthorizationService' },
    });
  }

  async getEffectivePermissions(_user: UserIdentity): Promise<Permission[]> {
    const role = Role.CUSTOMER;
    return this.resolver.getEffectivePermissions(role);
  }

  async isAtLeastRole(user: UserIdentity, minimumRole: Role): Promise<boolean> {
    const role = Role.CUSTOMER;
    return this.resolver.isAtLeastRole(role, minimumRole);
  }

  async requireRole(user: UserIdentity, minimumRole: Role): Promise<void> {
    const has = await this.isAtLeastRole(user, minimumRole);
    if (!has) {
      throw new AuthorizationError(`Required role: ${minimumRole}`);
    }
  }
}
