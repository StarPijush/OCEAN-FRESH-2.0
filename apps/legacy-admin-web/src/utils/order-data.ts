import type { Order, OrderItem } from '@oceanfresh/shared';

import type { OrderData } from '../types.js';

export function toOrderData(o: Order): OrderData {
  return {
    id: o.id,
    name: o.customerSnapshot?.name ?? '',
    phone: o.customerSnapshot?.phone ?? '',
    address: o.shippingSnapshot?.address ?? '',
    items: (o.items ?? []).map((i: OrderItem) => ({
      name: i.snapshot?.name ?? '',
      qty: i.quantity,
      price: i.unitPrice?.amount ?? 0,
      sub: i.subtotal?.amount ?? 0,
    })),
    total: o.totals?.grandTotal?.amount ?? 0,
    status: o.status,
    ts: new Date(o.createdAt).getTime(),
  };
}
