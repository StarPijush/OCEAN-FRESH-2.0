import { createLogger } from '@oceanfresh/shared';

const logger = createLogger('order:number');

export class OrderNumberGenerator {
  async generateNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const prefix = `OF-${year}-`;
      return `${prefix}${String(Date.now()).slice(-6)}`;
    } catch (err) {
      logger.error('Failed to generate order number', { error: err });
      const fallback = `OF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      return fallback;
    }
  }
}
