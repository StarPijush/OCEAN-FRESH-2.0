import type { AuthSession, DeviceInfo, UserIdentity, Claims } from '@oceanfresh/shared';

export interface IAuthRepository {
  findSessionById(sessionId: string): Promise<AuthSession | null>;
  findSessionsByUserId(userId: string): Promise<AuthSession[]>;
  saveSession(session: AuthSession): Promise<void>;
  updateSession(sessionId: string, data: Partial<AuthSession>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  deleteAllUserSessions(userId: string): Promise<void>;
  findDeviceById(deviceId: string): Promise<DeviceInfo | null>;
  findKnownDevices(userId: string): Promise<DeviceInfo[]>;
  saveDevice(userId: string, device: DeviceInfo): Promise<void>;
  updateDevice(userId: string, deviceId: string, data: Partial<DeviceInfo>): Promise<void>;
  deleteDevice(userId: string, deviceId: string): Promise<void>;
  saveAuditLog(entry: AuditLogEntry): Promise<void>;
  findAuditLogs(userId: string, limit?: number): Promise<AuditLogEntry[]>;
  getUserById(userId: string): Promise<UserIdentity | null>;
  saveUser(user: UserIdentity): Promise<void>;
  updateUser(userId: string, data: Partial<UserIdentity>): Promise<void>;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  event: string;
  actorId: string;
  targetId?: string;
  correlationId: string;
  source: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}
