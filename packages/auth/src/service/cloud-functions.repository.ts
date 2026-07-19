import type { Claims, Role } from '@oceanfresh/shared';

export interface ICloudFunctionsRepository {
  assignRole(uid: string, role: Role): Promise<void>;
  updateClaims(uid: string, claims: Partial<Claims>): Promise<void>;
  disableUser(uid: string, reason: string): Promise<void>;
  enableUser(uid: string): Promise<void>;
  deleteUser(uid: string): Promise<void>;
  revokeSessions(uid: string): Promise<void>;
  getAuditLogs(uid: string, limit?: number): Promise<AuditLogEntry[]>;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
