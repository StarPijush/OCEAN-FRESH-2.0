import type { AuditAction, AuditEntry } from '../interface.js';
import { createLogger } from '../factory.js';

const logger = createLogger('audit');

export interface AuditPersistence {
  write(entry: AuditEntry): Promise<void>;
}

let persistenceImpl: AuditPersistence | null = null;

export function setAuditPersistence(impl: AuditPersistence): void {
  persistenceImpl = impl;
}

export class AuditLogger {
  async log(action: AuditAction): Promise<void> {
    const entry: AuditEntry = {
      action: action.type,
      resource: action.resource,
      resourceId: action.resourceId,
      performedBy: action.userId,
      before: action.before,
      after: action.after,
      ipAddress: action.ipAddress ?? null,
      userAgent: action.userAgent ?? null,
      timestamp: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      },
    };

    if (persistenceImpl) {
      try {
        await persistenceImpl.write(entry);
      } catch (err) {
        logger.error('Failed to write audit log', err, { action: action.type });
      }
    }
  }
}

export const auditLogger = new AuditLogger();
