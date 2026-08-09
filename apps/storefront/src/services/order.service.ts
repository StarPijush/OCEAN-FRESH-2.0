import { getOrderRepository } from '@oceanfresh/order/repository';
import {
  type Order,
  type OrderItem,
  OrderSource,
  OrderStatus,
  type PaymentSummary,
  ProductUnit,
  STORE_SETTINGS,
} from '@oceanfresh/shared';

import type { ProductVM } from './product.service.js';

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
}

export interface OrderCartEntry {
  product: ProductVM;
  quantity: number;
}

export interface OrderPricing {
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export interface LocationData {
  lat: number;
  lng: number;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

const money = (amount: number) => ({ amount, currency: 'INR' });

export async function persistOrder(
  data: OrderFormData,
  entries: OrderCartEntry[],
  pricing: OrderPricing,
  location: LocationData | null,
): Promise<void> {
  const now = new Date();

  const items: OrderItem[] = entries.map(({ product, quantity }) => ({
    id: generateId(),
    productId: product.id,
    snapshot: {
      productId: product.id,
      name: product.name,
      sku: null,
      thumbnail: product.image ?? '',
      image: product.image ?? '',
      price: money(product.price),
      currency: 'INR',
      unit: ProductUnit.KG,
      variantSummary: null,
    },
    quantity,
    unitPrice: money(product.price),
    subtotal: money(product.price * quantity),
  }));

  const order: Order = {
    id: generateId(),
    orderNumber: `OF-${now.getFullYear()}-${String(Date.now()).slice(-6)}`,
    idempotencyKey: `cod-${generateId()}`,
    source: OrderSource.CHECKOUT,
    status: OrderStatus.VALIDATING,
    items,
    totals: {
      subtotal: money(pricing.subtotal),
      discount: money(0),
      shipping: money(pricing.deliveryCharge),
      tax: money(0),
      grandTotal: money(pricing.total),
    },
    customerSnapshot: {
      name: data.name,
      email: null,
      phone: data.phone,
      address: data.address,
      city: '',
      state: '',
      pincode: '',
    },
    shippingSnapshot: {
      address: data.address,
      city: '',
      state: '',
      pincode: '',
      method: 'delivery',
      amount: money(pricing.deliveryCharge),
    },
    billingSnapshot: {
      address: data.address,
      city: '',
      state: '',
      pincode: '',
      gstin: null,
    },
    payment: {
      method: 'COD',
      transactionId: null,
      paidAmount: null,
      paidAt: null,
      gatewayResponse: null,
    } satisfies PaymentSummary,
    timeline: [
      {
        status: OrderStatus.VALIDATING,
        timestamp: now,
        changedBy: 'customer',
        note: 'Order placed (Cash on Delivery)',
      },
    ],
    notes: location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : '',
    cartId: null,
    userId: null,
    createdAt: now,
    updatedAt: now,
  };

  await getOrderRepository().create(order);
}

export const orderService = {
  validateForm(data: OrderFormData, cartEntries: OrderCartEntry[]): string | null {
    if (!data.name.trim()) return 'Enter your name';
    if (!data.phone.trim()) return 'Enter phone number';
    if (!data.address.trim()) return 'Enter delivery address';
    if (!cartEntries.length) return 'Cart is empty';
    return null;
  },

  calculatePricing(
    cartEntries: OrderCartEntry[],
    freeDeliveryThreshold = STORE_SETTINGS.freeDeliveryAbove,
    deliveryFee = STORE_SETTINGS.deliveryFee,
  ): OrderPricing {
    const subtotal = cartEntries.reduce(
      (sum, entry) => sum + entry.product.price * entry.quantity,
      0,
    );
    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
    return {
      subtotal,
      deliveryCharge,
      total: subtotal + deliveryCharge,
    };
  },

  buildWhatsAppMessage(
    data: OrderFormData,
    entries: OrderCartEntry[],
    pricing: OrderPricing,
    location?: LocationData,
  ): string {
    const lines = entries
      .map(
        (entry) =>
          `\u2022 ${entry.product.name} \u2014 ${entry.quantity}kg \u2014 \u20B9${entry.product.price * entry.quantity}`,
      )
      .join('\n');

    const deliveryLine =
      pricing.deliveryCharge > 0
        ? `\u{1F69A} *Delivery: \u20B9${pricing.deliveryCharge}*`
        : '\u{1F69A} *Delivery: Free*';

    const locLine = location
      ? `\u{1F4CD} Location:\nhttps://www.google.com/maps?q=${location.lat},${location.lng}`
      : '\u{1F4CD} Location: not shared';

    return [
      '\u{1F41F} *New Order \u2014 OceanFresh*',
      '',
      `\u{1F464} *Name:* ${data.name}`,
      `\u{1F4F1} *Phone:* ${data.phone}`,
      '',
      '*Order:*',
      lines,
      '',
      `\u{1F4B0} *Subtotal: \u20B9${pricing.subtotal}*`,
      deliveryLine,
      `\u{1F4B0} *Total: \u20B9${pricing.total}*`,
      '',
      `\u{1F3E0} *Address:*\n${data.address}`,
      '',
      locLine,
      '',
      '_via OceanFresh_',
    ].join('\n');
  },

  sendViaWhatsApp(message: string, waNumber = STORE_SETTINGS.orderWhatsApp): void {
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  },
};
