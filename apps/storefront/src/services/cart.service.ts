import { calculatePriceFromKg, type WeightMode } from '@oceanfresh/shared/domain';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartWeightEntry {
  display: string;
  grams: number;
  /** Customer mode GRAM|KG — display, not product unit */
  mode: WeightMode;
  /** Canonical price per KG */
  pricePerKg: number;
  lineTotal: number;
  /** Legacy compat */
  unit?: WeightMode;
  pricePerUnit?: number;
}

interface CartState {
  items: Record<string, CartWeightEntry>;
}

interface CartActions {
  setWeight: (
    id: string,
    display: string,
    grams: number,
    mode: WeightMode,
    pricePerKg: number,
  ) => void;
  removeAll: (id: string) => void;
  clear: () => void;
  addItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
}

const CART_KEY = 'fresh-catch-cart-v2';
const LEGACY_KEY = 'fresh-catch-cart';

function migrateLegacy(): Record<string, CartWeightEntry> | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const legacyItems = parsed?.state?.items ?? parsed?.items ?? null;
    if (!legacyItems || typeof legacyItems !== 'object') return null;
    const hasNumeric = Object.values(legacyItems as Record<string, unknown>).some(
      (v) => typeof v === 'number',
    );
    if (hasNumeric) {
      localStorage.removeItem(LEGACY_KEY);
      return {};
    }
    return null;
  } catch {
    return null;
  }
}

const useStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: (() => {
        const m = migrateLegacy();
        return m ?? {};
      })(),
      setWeight: (id, display, grams, mode, pricePerKg) => {
        if (!display || !grams || grams <= 0) return;
        if (mode !== 'GRAM' && mode !== 'KG') return;
        if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) return;
        const lineTotal = calculatePriceFromKg(pricePerKg, grams);
        set((state) => {
          const existing = state.items[id];
          if (existing && existing.display === display) {
            const nextGrams = existing.grams + grams;
            const nextDisplay =
              mode === 'GRAM'
                ? `${nextGrams}g`
                : `${parseFloat((nextGrams / 1000).toFixed(3)).toString()}kg`;
            const nextTotal = calculatePriceFromKg(pricePerKg, nextGrams);
            return {
              items: {
                ...state.items,
                [id]: {
                  display: nextDisplay,
                  grams: nextGrams,
                  mode,
                  pricePerKg,
                  lineTotal: nextTotal,
                },
              },
            };
          }
          return {
            items: {
              ...state.items,
              [id]: { display, grams, mode, pricePerKg, lineTotal },
            },
          };
        });
      },
      removeAll: (id) =>
        set((s) => ({
          items: Object.fromEntries(Object.entries(s.items).filter(([key]) => key !== id)),
        })),
      clear: () => set({ items: {} }),
      addItem: () => {
        console.warn('addItem is deprecated: use setWeight');
      },
      updateQty: () => {
        console.warn('updateQty is deprecated: use setWeight');
      },
      removeItem: () => {
        console.warn('removeItem is deprecated: use removeAll');
      },
    }),
    {
      name: CART_KEY,
      version: 3,
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState as CartState;
        const maybe = persistedState as { items?: Record<string, Record<string, unknown>> };
        if (!maybe.items) return persistedState as CartState;
        // v0/v1 numeric -> clear
        if (version === 0 || version === 1) {
          const hasNumeric = Object.values(maybe.items).some(
            (v) => typeof (v as unknown as number) === 'number',
          );
          if (hasNumeric) return { items: {} } as CartState;
        }
        // v2 -> v3: unit/pricePerUnit -> mode/pricePerKg
        if (version === 2) {
          const next: Record<string, CartWeightEntry> = {};
          for (const [id, entry] of Object.entries(maybe.items)) {
            const oldUnit = (entry as Record<string, unknown>).unit as string | undefined;
            const oldMode = (entry as Record<string, unknown>).mode as string | undefined;
            const mode = (oldMode ?? oldUnit ?? 'GRAM') as WeightMode;
            const pricePerUnit = (entry as Record<string, unknown>).pricePerUnit as
              number | undefined;
            const pricePerKgRaw = (entry as Record<string, unknown>).pricePerKg as
              number | undefined;
            let pricePerKg = pricePerKgRaw;
            if (pricePerKg == null && pricePerUnit != null) {
              // Legacy GRAM price was per gram -> *1000
              pricePerKg = mode === 'GRAM' ? pricePerUnit * 1000 : pricePerUnit;
            }
            if (pricePerKg == null) pricePerKg = 0;
            const display = (entry.display as string) ?? '';
            const grams = (entry.grams as number) ?? 0;
            const lineTotal = pricePerKg
              ? calculatePriceFromKg(pricePerKg, grams)
              : ((entry.lineTotal as number) ?? 0);
            next[id] = {
              display,
              grams,
              mode: mode as WeightMode,
              pricePerKg,
              lineTotal,
            };
          }
          return { items: next } as CartState;
        }
        return persistedState as CartState;
      },
    },
  ),
);

export { useStore as useCartStore };
