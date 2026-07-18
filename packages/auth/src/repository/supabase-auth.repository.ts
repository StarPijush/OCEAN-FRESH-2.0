import { supabaseService, rowToCamelCase, objToSnakeCase, stripId } from '@oceanfresh/supabase';
import { createLogger, RepositoryError, NotFoundError, type AuthSession, type DeviceInfo, type UserIdentity } from '@oceanfresh/shared';
import type { IAuthRepository, AuditLogEntry } from './auth.repository.js';

const logger = createLogger('auth:repository:supabase');

const TABLES = {
  sessions: 'auth_sessions',
  devices: 'auth_devices',
  auditLogs: 'audit_logs',
  users: 'users',
};

export class SupabaseAuthRepository implements IAuthRepository {
  async findSessionById(sessionId: string): Promise<AuthSession | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLES.sessions, sessionId);
      if (!row) return null;
      return rowToCamelCase<AuthSession>(row);
    } catch (err) {
      throw new RepositoryError('Failed to find session', 'findSessionById', TABLES.sessions, { sessionId, error: err });
    }
  }

  async findSessionsByUserId(userId: string): Promise<AuthSession[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLES.sessions, [
        { field: 'user_id', operator: 'eq', value: userId },
        { field: 'is_revoked', operator: 'eq', value: false },
      ], { orderByField: 'last_activity_at', orderDirection: 'desc' });
      return rows.map((r) => rowToCamelCase<AuthSession>(r));
    } catch (err) {
      throw new RepositoryError('Failed to find sessions by user', 'findSessionsByUserId', TABLES.sessions, { userId, error: err });
    }
  }

  async saveSession(session: AuthSession): Promise<void> {
    try {
      const snakeData = objToSnakeCase(session as unknown as Record<string, unknown>);
      await supabaseService.upsert(TABLES.sessions, session.id, snakeData);
    } catch (err) {
      throw new RepositoryError('Failed to save session', 'saveSession', TABLES.sessions, { sessionId: session.id, error: err });
    }
  }

  async updateSession(sessionId: string, data: Partial<AuthSession>): Promise<void> {
    try {
      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      await supabaseService.update(TABLES.sessions, sessionId, snakeData);
    } catch (err) {
      throw new RepositoryError('Failed to update session', 'updateSession', TABLES.sessions, { sessionId, error: err });
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await supabaseService.remove(TABLES.sessions, sessionId);
    } catch (err) {
      throw new RepositoryError('Failed to delete session', 'deleteSession', TABLES.sessions, { sessionId, error: err });
    }
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.findSessionsByUserId(userId);
      for (const session of sessions) {
        await this.deleteSession(session.id);
      }
    } catch (err) {
      throw new RepositoryError('Failed to delete user sessions', 'deleteAllUserSessions', TABLES.sessions, { userId, error: err });
    }
  }

  async findDeviceById(deviceId: string): Promise<DeviceInfo | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLES.devices, deviceId);
      if (!row) return null;
      return rowToCamelCase<DeviceInfo>({ ...row, id: row.id });
    } catch (err) {
      throw new RepositoryError('Failed to find device', 'findDeviceById', TABLES.devices, { deviceId, error: err });
    }
  }

  async findKnownDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLES.devices, [
        { field: 'user_id', operator: 'eq', value: userId },
      ], { orderByField: 'last_login_at', orderDirection: 'desc' });
      return rows.map((r) => rowToCamelCase<DeviceInfo>({ ...r, id: r.id }));
    } catch (err) {
      throw new RepositoryError('Failed to find known devices', 'findKnownDevices', TABLES.devices, { userId, error: err });
    }
  }

  async saveDevice(userId: string, device: DeviceInfo): Promise<void> {
    try {
      const data = objToSnakeCase({ ...device, userId } as unknown as Record<string, unknown>);
      await supabaseService.upsert(TABLES.devices, device.id, data);
    } catch (err) {
      throw new RepositoryError('Failed to save device', 'saveDevice', TABLES.devices, { userId, deviceId: device.id, error: err });
    }
  }

  async updateDevice(userId: string, deviceId: string, data: Partial<DeviceInfo>): Promise<void> {
    try {
      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      await supabaseService.update(TABLES.devices, deviceId, snakeData);
    } catch (err) {
      throw new RepositoryError('Failed to update device', 'updateDevice', TABLES.devices, { userId, deviceId, error: err });
    }
  }

  async deleteDevice(userId: string, deviceId: string): Promise<void> {
    try {
      await supabaseService.remove(TABLES.devices, deviceId);
    } catch (err) {
      throw new RepositoryError('Failed to delete device', 'deleteDevice', TABLES.devices, { userId, deviceId, error: err });
    }
  }

  async saveAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const snakeData = objToSnakeCase(entry as unknown as Record<string, unknown>);
      await supabaseService.upsert(TABLES.auditLogs, entry.id, snakeData);
    } catch (err) {
      throw new RepositoryError('Failed to save audit log', 'saveAuditLog', TABLES.auditLogs, { entryId: entry.id, error: err });
    }
  }

  async findAuditLogs(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLES.auditLogs, [
        { field: 'user_id', operator: 'eq', value: userId },
      ], { orderByField: 'timestamp', orderDirection: 'desc', limitCount: limit });
      return rows.map((r) => rowToCamelCase<AuditLogEntry>({ ...r, id: r.id }));
    } catch (err) {
      throw new RepositoryError('Failed to find audit logs', 'findAuditLogs', TABLES.auditLogs, { userId, error: err });
    }
  }

  async getUserById(userId: string): Promise<UserIdentity | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLES.users, userId);
      if (!row) return null;
      return rowToCamelCase<UserIdentity>({ ...row, id: row.id });
    } catch (err) {
      throw new RepositoryError('Failed to find user', 'getUserById', TABLES.users, { userId, error: err });
    }
  }

  async saveUser(user: UserIdentity): Promise<void> {
    try {
      const snakeData = objToSnakeCase(user as unknown as Record<string, unknown>);
      await supabaseService.upsert(TABLES.users, user.id, snakeData);
    } catch (err) {
      throw new RepositoryError('Failed to save user', 'saveUser', TABLES.users, { userId: user.id, error: err });
    }
  }

  async updateUser(userId: string, data: Partial<UserIdentity>): Promise<void> {
    try {
      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      await supabaseService.update(TABLES.users, userId, snakeData);
    } catch (err) {
      throw new RepositoryError('Failed to update user', 'updateUser', TABLES.users, { userId, error: err });
    }
  }
}
