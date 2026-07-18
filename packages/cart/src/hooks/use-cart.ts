import { useCart as useCartQuery, useCartByUserOrSession } from '../queries/index.js';

export function useGetCart(cartId: string | undefined) {
  return useCartQuery(cartId);
}

export function useGetActiveCart(userId: string | null | undefined, sessionId: string | null | undefined) {
  return useCartByUserOrSession(userId, sessionId);
}

export type { Cart } from '@oceanfresh/shared';
