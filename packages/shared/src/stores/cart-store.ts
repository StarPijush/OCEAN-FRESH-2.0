import type { Product } from '../types/product.js';

export interface CartStoreItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: Map<string, CartStoreItem>;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getItems: () => CartStoreItem[];
}

export type CartStore = CartState & CartActions;

// Zustand store will be created in the storefront app
// This file defines the interface for the store
