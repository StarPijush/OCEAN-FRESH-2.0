# Migration Guide — Legacy Order Types → @oceanfresh/order

## Overview
The legacy `@oceanfresh/shared` types (`OrderStatus`, `Order`, `OrderItem`, etc.) have been replaced with the new Clean Architecture Order Domain. All existing code using the old types must be updated.

## Breaking Changes

### OrderStatus Enum
**Before:** 6 states: `PENDING`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`
**After:** 15 states: `DRAFT`, `VALIDATING`, `PENDING_PAYMENT`, `PAYMENT_FAILED`, `PAID`, `CONFIRMED`, `PROCESSING`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REFUND_REQUESTED`, `REFUNDED`, `ARCHIVED`

### Order Interface
**Before:** Flat fields (`subtotal: number`, `deliveryCharge: number`, `total: number`, `paymentStatus: string`)
**After:** Structured `totals: OrderTotals` with `Money` objects, `OrderProductSnapshot` items, `OrderCustomerSnapshot`, `OrderShippingSnapshot`, `OrderBillingSnapshot`, `OrderTimelineEntry[]`

### OrderItem Interface
**Before:** `{ productId, name, price: number, quantity, subtotal: number }`
**After:** `{ id, productId, snapshot: OrderProductSnapshot, quantity, unitPrice: Money, subtotal: Money }`

### Pricing Fields
**Before:** `subtotal: number`, `deliveryCharge: number`, `discount: number`, `total: number`
**After:** `totals: { subtotal: Money, discount: Money, shipping: Money, tax: Money, grandTotal: Money }`

### StatusHistory
**Before:** `statusHistory: StatusHistoryEntry[]`
**After:** `timeline: OrderTimelineEntry[]`

## Migration Steps

1. Replace `OrderStatus.PENDING` → `OrderStatus.DRAFT` or `OrderStatus.PENDING_PAYMENT`
2. Replace `OrderStatus.PREPARING` → `OrderStatus.PROCESSING`
3. Update all `Order` type references to use new structured fields
4. Replace flat pricing with `OrderTotals` + `Money` objects
5. Update `StatusHistoryEntry` → `OrderTimelineEntry`
6. Add `idempotencyKey`, `source`, `customerSnapshot`, `shippingSnapshot`, `billingSnapshot`, `payment: PaymentSummary`
7. Import from `@oceanfresh/order` instead of `@oceanfresh/shared`

## Rollback
Keep the `@oceanfresh/shared/src/types/order.ts` backup until full migration is verified.
