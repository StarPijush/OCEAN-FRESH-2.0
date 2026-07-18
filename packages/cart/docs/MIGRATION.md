# Migration Guide — Legacy Zustand Cart → @oceanfresh/cart

## Overview
If you were using a Zustand-based cart store in `@oceanfresh/shared/src/stores/cart-store.ts`, migrate to the Clean Architecture Cart Domain.

## Step 1: Replace Zustand with Repository + Service
**Before:**
```ts
import { useCartStore } from '@oceanfresh/shared';
const { items, addItem } = useCartStore();
```

**After:**
```ts
import { useAddCartItem, useCartBySession } from '@oceanfresh/cart';
const { data: cart } = useCartBySession(sessionId);
const { mutate: addItem } = useAddCartItem();
```

## Step 2: Update Component Imports
**Before:**
```tsx
import { CartIcon, CartDrawer } from '@oceanfresh/shared';
```

**After:**
```tsx
import { CartIcon, CartDrawer } from '@oceanfresh/cart';
```

## Step 3: Replace Direct State Mutations with TanStack Query
**Before:**
```ts
store.addItem(product);
```

**After:**
```ts
addItem({ cartId: cart.id, input: { productId: product.id, quantity: 1 } });
```

## Step 4: Wire IProductCatalog
If you were calling Firestore directly in the cart, replace with:
```ts
import { ProductCatalogImpl } from '@oceanfresh/product';
const catalog = new ProductCatalogImpl(productRepository);
```

## Breaking Changes
- `Cart` type now requires `source`, `status`, `totals`, `expiresAt`
- `CartItem.quantity` is now a `Quantity` class (not bare number)
- Cart mutations require `cartId` — no implicit store
- All client-set prices are overwritten by server-side calculation

## Rollback
Keep `@oceanfresh/shared/src/stores/cart-store.ts` until full migration is verified.
