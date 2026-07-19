import { useQuery } from '@tanstack/react-query';

import { getCartRepository } from '../repository/index.js';
import { cartKeys } from './cart.query-keys.js';

export function useCart(cartId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.detail(cartId as string),
    queryFn: () => getCartRepository().findById(cartId as string),
    enabled: !!cartId,
  });
}

export function useCartByUser(userId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.user(userId as string),
    queryFn: () => getCartRepository().findByUserId(userId as string),
    enabled: !!userId,
  });
}

export function useCartBySession(sessionId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.session(sessionId as string),
    queryFn: () => getCartRepository().findBySessionId(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useCartByUserOrSession(
  userId: string | null | undefined,
  sessionId: string | null | undefined,
) {
  return useQuery({
    queryKey: [...cartKeys.all, 'lookup', userId ?? 'null', sessionId ?? 'null'],
    queryFn: () => getCartRepository().findByUserOrSession(userId ?? null, sessionId ?? null),
    enabled: !!userId || !!sessionId,
  });
}
