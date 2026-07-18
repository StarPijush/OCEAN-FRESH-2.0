import { createLogger, CartSource } from '@oceanfresh/shared';
import type { ICartRepository } from '../repository/index.js';
import type { Cart, CartItem } from '@oceanfresh/shared';

const logger = createLogger('cart:merge');

export interface MergeConflictResolution {
  strategy: 'keep_destination' | 'keep_source' | 'combine';
}

const DEFAULT_RESOLUTION: MergeConflictResolution = { strategy: 'combine' };

export class CartMergeService {
  constructor(private readonly repository: ICartRepository) {}

  async mergeGuestIntoUser(sessionId: string, userId: string): Promise<Cart> {
    logger.info('Merging guest cart into user cart', { sessionId, userId });

    const userCart = await this.repository.findByUserId(userId);
    const guestCart = await this.repository.findBySessionId(sessionId);

    if (!guestCart) {
      logger.debug('No guest cart to merge', { sessionId });
      if (userCart) return userCart;
      return this.repository.create({ userId, sessionId: null, source: CartSource.AUTHENTICATED });
    }

    if (!userCart) {
      logger.debug('No user cart, adopting guest cart', { sessionId });
      const updated = await this.repository.merge(guestCart.id, guestCart.id);
      return updated;
    }

    const merged = await this.mergeCarts(userCart, guestCart, DEFAULT_RESOLUTION);
    return merged;
  }

  async mergeCarts(
    destination: Cart,
    source: Cart,
    resolution: MergeConflictResolution = DEFAULT_RESOLUTION,
  ): Promise<Cart> {
    if (resolution.strategy === 'keep_destination') {
      return this.repository.merge(destination.id, source.id);
    }

    if (resolution.strategy === 'keep_source') {
      return this.repository.merge(source.id, destination.id);
    }

    return this.repository.merge(destination.id, source.id);
  }

  resolveConflicts(destination: CartItem[], source: CartItem[]): CartItem[] {
    const destMap = new Map(destination.map((item) => [item.productId, item]));
    const result = [...destination];

    for (const sourceItem of source) {
      const existing = destMap.get(sourceItem.productId);
      if (!existing) {
        result.push(sourceItem);
      }
    }

    return result;
  }
}
