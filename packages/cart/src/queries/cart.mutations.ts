import type { AddToCartInput, Cart, CartSource } from '@oceanfresh/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getCartRepository } from '../repository/index.js';
import { cartKeys } from './cart.query-keys.js';

export function useCreateCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string | null; sessionId: string | null; source: CartSource }) =>
      getCartRepository().create(data),
    onSuccess: (cart: Cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cart.id) });
    },
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartId, input }: { cartId: string; input: AddToCartInput }) =>
      getCartRepository().addItem(cartId, input as unknown as Cart['items'][0]),
    onSuccess: (_data: Cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartId,
      itemId,
      quantity,
    }: {
      cartId: string;
      itemId: string;
      quantity: number;
    }) => getCartRepository().updateItem(cartId, itemId, quantity, { amount: 0, currency: 'INR' }),
    onSuccess: (cart: Cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cart.id) });
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartId, itemId }: { cartId: string; itemId: string }) =>
      getCartRepository().removeItem(cartId, itemId),
    onSuccess: (cart: Cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cart.id) });
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => getCartRepository().clearItems(cartId),
    onSuccess: (cart: Cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cart.id) });
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() });
    },
  });
}

export function useMergeCarts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ destinationId, sourceId }: { destinationId: string; sourceId: string }) =>
      getCartRepository().merge(destinationId, sourceId),
    onSuccess: (cart: Cart) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cart.id) });
    },
  });
}

export function useDeleteCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => getCartRepository().delete(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
