import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: Record<string, number>;
}

interface CartActions {
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  removeAll: (id: string) => void;
  clear: () => void;
}

const useStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: {},
      addItem: (id: string) =>
        set((state) => ({
          items: { ...state.items, [id]: (state.items[id] ?? 0) + 1 },
        })),
      removeItem: (id: string) => {
        const state = get();
        if (state.items[id] && state.items[id] > 1) {
          set((s) => ({
            items: { ...s.items, [id]: (s.items[id] ?? 0) - 1 },
          }));
        } else {
          set((s) => ({
            items: Object.fromEntries(Object.entries(s.items).filter(([key]) => key !== id)),
          }));
        }
      },
      updateQty: (id: string, delta: number) => {
        const state = get();
        const current = state.items[id] ?? 0;
        const next = current + delta;
        if (next <= 0) {
          set((s) => ({
            items: Object.fromEntries(Object.entries(s.items).filter(([key]) => key !== id)),
          }));
        } else {
          set((s) => ({
            items: { ...s.items, [id]: next },
          }));
        }
      },
      removeAll: (id: string) =>
        set((s) => ({
          items: Object.fromEntries(Object.entries(s.items).filter(([key]) => key !== id)),
        })),
      clear: () => set({ items: {} }),
    }),
    { name: 'fresh-catch-cart' },
  ),
);

export { useStore as useCartStore };
