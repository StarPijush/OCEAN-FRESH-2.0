import { getOrderRepository } from '@oceanfresh/order/repository';
import { getProductRepository } from '@oceanfresh/product/repository';
import {
  type Order,
  type OrderItem,
  OrderSource,
  OrderStatus,
  type PaymentSummary,
  STORE_SETTINGS,
} from '@oceanfresh/shared';
import { calculatePriceFromKg, parseWeightInput, type WeightMode } from '@oceanfresh/shared/domain';

import type { ProductVM } from './product.service.js';

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
}

export interface OrderCartEntry {
  product: ProductVM;
  display: string;
  grams: number;
  /** Customer mode GRAM|KG */
  mode: WeightMode;
  lineTotal: number;
  pricePerKg: number;
  // Legacy compat
  unit?: WeightMode;
  pricePerUnit?: number;
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
  _pricing: OrderPricing,
  location: LocationData | null,
): Promise<{ orderNumber: string; total: number }> {
  const now = new Date();

  const productRepo = getProductRepository();
  for (const entry of entries) {
    const mode = (entry.mode ?? entry.unit ?? 'GRAM') as WeightMode;
    const pricePerKg = entry.pricePerKg ?? entry.pricePerUnit ?? 0;
    const authoritative = await productRepo.findById(entry.product.id);
    if (!authoritative) throw new Error(`Product not found: ${entry.product.name}`);
    if (authoritative.status !== 'ACTIVE') throw new Error(`${entry.product.name} is out of stock`);
    // Validate weight parse with mode
    const parsed = parseWeightInput(entry.display, mode);
    if (!parsed.success || parsed.grams !== entry.grams)
      throw new Error(`Invalid weight for ${entry.product.name}`);
    const expectedTotal = calculatePriceFromKg(Number(authoritative.price), entry.grams);
    if (Math.abs(expectedTotal - entry.lineTotal) > 0.01) {
      throw new Error(`Price mismatch for ${entry.product.name}`);
    }
    if (Math.abs(Number(authoritative.price) - pricePerKg) > 0.01) {
      throw new Error(`Price tamper detected for ${entry.product.name}`);
    }
  }

  const authoritativePricing = (() => {
    const subtotal = entries.reduce((sum, e) => sum + e.lineTotal, 0);
    const deliveryCharge =
      subtotal >= STORE_SETTINGS.freeDeliveryAbove ? 0 : STORE_SETTINGS.deliveryFee;
    return { subtotal, deliveryCharge, total: subtotal + deliveryCharge };
  })();
  const finalPricing = authoritativePricing;

  const items: OrderItem[] = entries.map((entry) => {
    const mode = (entry.mode ?? entry.unit ?? 'GRAM') as WeightMode;
    const pricePerKg = entry.pricePerKg ?? entry.pricePerUnit ?? 0;
    const snapshot = {
      productId: entry.product.id,
      name: entry.product.name,
      sku: null,
      thumbnail: entry.product.image ?? '',
      image: entry.product.image ?? '',
      price: money(pricePerKg),
      currency: 'INR' as const,
      unit: mode,
      variantSummary: null as string | null,
      weightDisplay: entry.display,
      weightGrams: entry.grams,
    } as unknown as OrderItem['snapshot'];

    const subtotal = entry.lineTotal;
    const quantityGrams = Math.round(entry.grams);
    return {
      id: generateId(),
      productId: entry.product.id,
      snapshot,
      quantity: quantityGrams,
      unitPrice: money(pricePerKg),
      subtotal: money(subtotal),
      weightGrams: entry.grams,
      weightDisplay: entry.display,
      productUnit: mode,
    } as OrderItem;
  });

  const orderNumber = `OF-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;

  const order: Order = {
    id: generateId(),
    orderNumber,
    idempotencyKey: `cod-${generateId()}`,
    source: OrderSource.CHECKOUT,
    status: OrderStatus.VALIDATING,
    items,
    totals: {
      subtotal: money(finalPricing.subtotal),
      discount: money(0),
      shipping: money(finalPricing.deliveryCharge),
      tax: money(0),
      grandTotal: money(finalPricing.total),
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
      amount: money(finalPricing.deliveryCharge),
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

  await getOrderRepository().create(order as unknown as Order);
  return { orderNumber, total: finalPricing.total };
}

export const orderService = {
  validateForm(data: OrderFormData, cartEntries: OrderCartEntry[]): string | null {
    if (!data.name.trim()) return 'Enter your name';
    if (!data.phone.trim()) return 'Enter phone number';
    if (!data.address.trim()) return 'Enter delivery address';
    if (!cartEntries.length) return 'Cart is empty';
    for (const e of cartEntries) {
      const mode = (e.mode ?? e.unit ?? 'GRAM') as WeightMode;
      const pricePerKg = e.pricePerKg ?? e.pricePerUnit ?? 0;
      if (!e.display || !e.grams || e.grams <= 0) return `Invalid weight for ${e.product.name}`;
      const parsed = parseWeightInput(e.display, mode);
      if (!parsed.success) return parsed.error ?? `Invalid weight for ${e.product.name}`;
      try {
        const price = calculatePriceFromKg(pricePerKg, e.grams);
        if (price <= 0) return `Invalid price for ${e.product.name}`;
      } catch {
        return `Invalid pricing for ${e.product.name}`;
      }
      if (e.product.status !== 'ACTIVE') return `${e.product.name} is out of stock`;
    }
    return null;
  },

  calculatePricing(
    cartEntries: OrderCartEntry[],
    freeDeliveryThreshold = STORE_SETTINGS.freeDeliveryAbove,
    deliveryFee = STORE_SETTINGS.deliveryFee,
  ): OrderPricing {
    const subtotal = cartEntries.reduce((sum, entry) => sum + entry.lineTotal, 0);
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
          `\u2022 ${entry.product.name} \u2014 ${entry.display} \u2014 \u20B9${entry.lineTotal}`,
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
