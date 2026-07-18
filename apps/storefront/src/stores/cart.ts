import { create } from 'zustand';

interface CartState {
  items: Record<string, number>;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  removeAll: (id: string) => void;
  clear: () => void;
  getCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  addItem: (id: string) =>
    set((state) => ({
      items: { ...state.items, [id]: (state.items[id] ?? 0) + 1 },
    })),
  removeItem: (id: string) => {
    const state = get();
    if (state.items[id] && state.items[id]! > 1) {
      set((s) => ({
        items: { ...s.items, [id]: s.items[id]! - 1 },
      }));
    } else {
      set((s) => {
        const next = { ...s.items };
        delete next[id];
        return { items: next };
      });
    }
  },
  updateQty: (id: string, delta: number) => {
    const state = get();
    const current = state.items[id] ?? 0;
    const next = current + delta;
    if (next <= 0) {
      set((s) => {
        const copy = { ...s.items };
        delete copy[id];
        return { items: copy };
      });
    } else {
      set((s) => ({
        items: { ...s.items, [id]: next },
      }));
    }
  },
  removeAll: (id: string) =>
    set((s) => {
      const next = { ...s.items };
      delete next[id];
      return { items: next };
    }),
  clear: () => set({ items: {} }),
  getCount: () => Object.values(get().items).reduce((a, b) => a + b, 0),
}));
