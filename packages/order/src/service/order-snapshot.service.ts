import type { CartCheckoutContext } from '@oceanfresh/cart';
import type {
  OrderBillingSnapshot,
  OrderCustomerSnapshot,
  OrderProductSnapshot,
  OrderShippingSnapshot,
} from '@oceanfresh/shared';

export class OrderSnapshotService {
  createProductSnapshot(context: CartCheckoutContext): OrderProductSnapshot[] {
    return context.items.map((item) => ({
      productId: item.productId,
      name: item.snapshot.name,
      sku: item.snapshot.sku,
      thumbnail: item.snapshot.thumbnail,
      image: item.snapshot.image,
      price: { ...item.snapshot.price },
      currency: item.snapshot.currency,
      unit: item.snapshot.unit,
      variantSummary: item.snapshot.variantSummary,
    }));
  }

  createCustomerSnapshot(input: {
    name: string;
    email: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }): OrderCustomerSnapshot {
    return {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
    };
  }

  createShippingSnapshot(input: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    method: string;
    amount: { amount: number; currency: string };
  }): OrderShippingSnapshot {
    return {
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      method: input.method,
      amount: { ...input.amount },
    };
  }

  createBillingSnapshot(input: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstin: string | null;
  }): OrderBillingSnapshot {
    return {
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      gstin: input.gstin,
    };
  }
}
