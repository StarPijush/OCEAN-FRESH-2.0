import { firestoreService } from '@oceanfresh/firebase';
import { Timestamp } from 'firebase/firestore';
import { createLogger, RepositoryError, NotFoundError, type AuthSession, type DeviceInfo, type UserIdentity } from '@oceanfresh/shared';
import type { IAuthRepository, AuditLogEntry } from './auth.repository.js';

const logger = createLogger('auth:repository');
const COLLECTIONS = {
  sessions: 'auth_sessions',
  devices: 'auth_devices',
  auditLogs: 'auditLogs',
  users: 'users',
};

function docToSession(id: string, data: Record<string, unknown>): AuthSession {
  return { id, ...data } as unknown as AuthSession;
}

function serializeSessionData(data: Record<string, unknown>): Record<string, unknown> {
  const { id: _id, ...rest } = data;
  return rest;
}

export class FirestoreAuthRepository implements IAuthRepository {
  async findSessionById(sessionId: string): Promise<AuthSession | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(COLLECTIONS.sessions, sessionId);
      if (!doc) return null;
      return docToSession(doc.id, doc);
    } catch (err) {
      throw new RepositoryError('Failed to find session', 'findSessionById', COLLECTIONS.sessions, { sessionId, error: err });
    }
  }

  async findSessionsByUserId(userId: string): Promise<AuthSession[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTIONS.sessions, [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isRevoked', operator: '==', value: false },
      ], { orderByField: 'lastActivityAt', orderDirection: 'desc' });
      return docs.map((d) => docToSession(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find sessions by user', 'findSessionsByUserId', COLLECTIONS.sessions, { userId, error: err });
    }
  }

  async saveSession(session: AuthSession): Promise<void> {
    try {
      await firestoreService.set(COLLECTIONS.sessions, session.id, serializeSessionData(session as unknown as Record<string, unknown>));
    } catch (err) {
      throw new RepositoryError('Failed to save session', 'saveSession', COLLECTIONS.sessions, { sessionId: session.id, error: err });
    }
  }

  async updateSession(sessionId: string, data: Partial<AuthSession>): Promise<void> {
    try {
      await firestoreService.update(COLLECTIONS.sessions, sessionId, serializeSessionData(data as unknown as Record<string, unknown>));
    } catch (err) {
      throw new RepositoryError('Failed to update session', 'updateSession', COLLECTIONS.sessions, { sessionId, error: err });
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await firestoreService.remove(COLLECTIONS.sessions, sessionId);
    } catch (err) {
      throw new RepositoryError('Failed to delete session', 'deleteSession', COLLECTIONS.sessions, { sessionId, error: err });
    }
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.findSessionsByUserId(userId);
      for (const session of sessions) {
        await this.deleteSession(session.id);
      }
    } catch (err) {
      throw new RepositoryError('Failed to delete user sessions', 'deleteAllUserSessions', COLLECTIONS.sessions, { userId, error: err });
    }
  }

  async findDeviceById(deviceId: string): Promise<DeviceInfo | null> {
    try {
      const allUsers = await this.getAllUserIds();
      for (const userId of allUsers) {
        const device = await this.findDeviceInUser(userId, deviceId);
        if (device) return device;
      }
      return null;
    } catch (err) {
      throw new RepositoryError('Failed to find device', 'findDeviceById', COLLECTIONS.devices, { deviceId, error: err });
    }
  }

  async findKnownDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        `${COLLECTIONS.devices}`,
        [{ field: 'userId', operator: '==', value: userId }],
        { orderByField: 'lastLoginAt', orderDirection: 'desc' },
      );
      return docs.map((d) => ({ ...d, id: d.id } as unknown as DeviceInfo));
    } catch (err) {
      throw new RepositoryError('Failed to find known devices', 'findKnownDevices', COLLECTIONS.devices, { userId, error: err });
    }
  }

  async saveDevice(userId: string, device: DeviceInfo): Promise<void> {
    try {
      await firestoreService.set(`${COLLECTIONS.devices}`, device.id, { ...device, userId } as unknown as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to save device', 'saveDevice', COLLECTIONS.devices, { userId, deviceId: device.id, error: err });
    }
  }

  async updateDevice(userId: string, deviceId: string, data: Partial<DeviceInfo>): Promise<void> {
    try {
      await firestoreService.update(`${COLLECTIONS.devices}`, deviceId, data as unknown as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to update device', 'updateDevice', COLLECTIONS.devices, { userId, deviceId, error: err });
    }
  }

  async deleteDevice(userId: string, deviceId: string): Promise<void> {
    try {
      await firestoreService.remove(`${COLLECTIONS.devices}`, deviceId);
    } catch (err) {
      throw new RepositoryError('Failed to delete device', 'deleteDevice', COLLECTIONS.devices, { userId, deviceId, error: err });
    }
  }

  async saveAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      await firestoreService.set(COLLECTIONS.auditLogs, entry.id, entry as unknown as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to save audit log', 'saveAuditLog', COLLECTIONS.auditLogs, { entryId: entry.id, error: err });
    }
  }

  async findAuditLogs(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTIONS.auditLogs, [
        { field: 'userId', operator: '==', value: userId },
      ], { orderByField: 'timestamp', orderDirection: 'desc', limitCount: limit });
      return docs.map((d) => ({ ...d, id: d.id } as unknown as AuditLogEntry));
    } catch (err) {
      throw new RepositoryError('Failed to find audit logs', 'findAuditLogs', COLLECTIONS.auditLogs, { userId, error: err });
    }
  }

  async getUserById(userId: string): Promise<UserIdentity | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(COLLECTIONS.users, userId);
      if (!doc) return null;
      return { id: doc.id, ...doc } as unknown as UserIdentity;
    } catch (err) {
      throw new RepositoryError('Failed to find user', 'getUserById', COLLECTIONS.users, { userId, error: err });
    }
  }

  async saveUser(user: UserIdentity): Promise<void> {
    try {
      await firestoreService.set(COLLECTIONS.users, user.id, user as unknown as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to save user', 'saveUser', COLLECTIONS.users, { userId: user.id, error: err });
    }
  }

  async updateUser(userId: string, data: Partial<UserIdentity>): Promise<void> {
    try {
      await firestoreService.update(COLLECTIONS.users, userId, data as unknown as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to update user', 'updateUser', COLLECTIONS.users, { userId, error: err });
    }
  }

  private async findDeviceInUser(userId: string, deviceId: string): Promise<DeviceInfo | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(`${COLLECTIONS.devices}`, deviceId);
      if (!doc) return null;
      return { ...doc, id: doc.id } as unknown as DeviceInfo;
    } catch {
      return null;
    }
  }

  private async getAllUserIds(): Promise<string[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTIONS.users, []);
      return docs.map((d) => d.id);
    } catch {
      return [];
    }
  }
}
