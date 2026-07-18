import type { Logger } from './interface.js';
import { ConsoleLogger } from './implementations/console.logger.js';
import { ProductionLogger } from './implementations/production.logger.js';

function isProduction(): boolean {
  try {
    if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') {
      return true;
    }
    if (typeof import.meta !== 'undefined') {
      const env = (import.meta as unknown as Record<string, Record<string, boolean>>).env;
      return env?.PROD === true;
    }
  } catch {
  }
  return false;
}

export function createLogger(module: string): Logger {
  return isProduction() ? new ProductionLogger(module) : new ConsoleLogger(module);
}

export const logger = createLogger('app');
