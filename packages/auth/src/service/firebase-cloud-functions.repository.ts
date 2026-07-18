import { callFunction } from '@oceanfresh/firebase';
import { createLogger, Role, RepositoryError, type Claims } from '@oceanfresh/shared';
import type { ICloudFunctionsRepository, AuditLogEntry } from './cloud-functions.repository.js';

const logger = createLogger('auth:cloud-functions');

export class FirebaseCloudFunctionsRepository implements ICloudFunctionsRepository {
  async assignRole(uid: string, role: Role): Promise<void> {
    try {
      await callFunction<{ uid: string; role: Role }, void>('assignRole', { uid, role });
    } catch (err) {
      throw new RepositoryError('Failed to assign role', 'assignRole', 'cloudFunctions', { uid, role, error: err });
    }
  }

  async updateClaims(uid: string, claims: Partial<Claims>): Promise<void> {
    try {
      await callFunction<{ uid: string; claims: Partial<Claims> }, void>('updateClaims', { uid, claims });
    } catch (err) {
      throw new RepositoryError('Failed to update claims', 'updateClaims', 'cloudFunctions', { uid, error: err });
    }
  }

  async disableUser(uid: string, reason: string): Promise<void> {
    try {
      await callFunction<{ uid: string; reason: string }, void>('disableUser', { uid, reason });
    } catch (err) {
      throw new RepositoryError('Failed to disable user', 'disableUser', 'cloudFunctions', { uid, error: err });
    }
  }

  async enableUser(uid: string): Promise<void> {
    try {
      await callFunction<{ uid: string }, void>('enableUser', { uid });
    } catch (err) {
      throw new RepositoryError('Failed to enable user', 'enableUser', 'cloudFunctions', { uid, error: err });
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await callFunction<{ uid: string }, void>('deleteUser', { uid });
    } catch (err) {
      throw new RepositoryError('Failed to delete user', 'deleteUser', 'cloudFunctions', { uid, error: err });
    }
  }

  async revokeSessions(uid: string): Promise<void> {
    try {
      await callFunction<{ uid: string }, void>('revokeSessions', { uid });
    } catch (err) {
      throw new RepositoryError('Failed to revoke sessions', 'revokeSessions', 'cloudFunctions', { uid, error: err });
    }
  }

  async getAuditLogs(uid: string, limit = 50): Promise<AuditLogEntry[]> {
    try {
      const result = await callFunction<{ uid: string; limit: number }, AuditLogEntry[]>('getAuditLogs', { uid, limit });
      return result ?? [];
    } catch (err) {
      throw new RepositoryError('Failed to get audit logs', 'getAuditLogs', 'cloudFunctions', { uid, error: err });
    }
  }
}
