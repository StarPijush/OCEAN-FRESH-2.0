import type { CartItem, CartTotals, Money } from '@oceanfresh/shared';

export interface TaxRate {
  rate: number;
  name: string;
}

export interface ShippingCalc {
  calculate(items: CartItem[], subtotal: Money): Promise<Money>;
}

const DEFAULT_TAX_RATE: TaxRate = { rate: 0.05, name: 'GST 5%' };
const DEFAULT_SHIPPING_THRESHOLD = 500;

export class CartPricingService {
  constructor(
    private readonly taxRate: TaxRate = DEFAULT_TAX_RATE,
    private readonly shippingCalc?: ShippingCalc,
  ) {}

  calculateSubtotal(items: CartItem[]): Money {
    const total = items.reduce((sum, item) => sum + item.subtotal.amount, 0);
    return { amount: Math.round(total * 100) / 100, currency: 'INR' };
  }

  calculateTax(subtotal: Money): Money {
    return {
      amount: Math.round(subtotal.amount * this.taxRate.rate * 100) / 100,
      currency: subtotal.currency,
    };
  }

  async calculateShipping(items: CartItem[], subtotal: Money): Promise<Money> {
    if (this.shippingCalc) {
      return this.shippingCalc.calculate(items, subtotal);
    }
    if (subtotal.amount >= DEFAULT_SHIPPING_THRESHOLD) {
      return { amount: 0, currency: subtotal.currency };
    }
    return { amount: 40, currency: subtotal.currency };
  }

  calculateDiscount(_items: CartItem[]): Money {
    return { amount: 0, currency: 'INR' };
  }

  async calculateTotals(items: CartItem[]): Promise<CartTotals> {
    const subtotal = this.calculateSubtotal(items);
    const tax = this.calculateTax(subtotal);
    const shipping = await this.calculateShipping(items, subtotal);
    const discount = this.calculateDiscount(items);
    const grandTotal = {
      amount:
        Math.round((subtotal.amount + tax.amount + shipping.amount - discount.amount) * 100) / 100,
      currency: subtotal.currency,
    };

    return { subtotal, tax, shipping, discount, grandTotal };
  }
}
