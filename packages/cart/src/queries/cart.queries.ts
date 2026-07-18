import { useQuery } from '@tanstack/react-query';
import { cartKeys } from './cart.query-keys.js';
import { getCartRepository } from '../repository/index.js';

export function useCart(cartId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.detail(cartId!),
    queryFn: () => getCartRepository().findById(cartId!),
    enabled: !!cartId,
  });
}

export function useCartByUser(userId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.user(userId!),
    queryFn: () => getCartRepository().findByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCartBySession(sessionId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.session(sessionId!),
    queryFn: () => getCartRepository().findBySessionId(sessionId!),
    enabled: !!sessionId,
  });
}

export function useCartByUserOrSession(userId: string | null | undefined, sessionId: string | null | undefined) {
  return useQuery({
    queryKey: [...cartKeys.all, 'lookup', userId ?? 'null', sessionId ?? 'null'],
    queryFn: () => getCartRepository().findByUserOrSession(userId ?? null, sessionId ?? null),
    enabled: !!userId || !!sessionId,
  });
}
