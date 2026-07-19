import type { CartCheckoutContext } from '@oceanfresh/cart';
import type { IProductCatalog } from '@oceanfresh/product';
import type { Money, OrderTotals } from '@oceanfresh/shared';

export class OrderPricingService {
  constructor(private readonly catalog: IProductCatalog) {}

  async calculateTotals(context: CartCheckoutContext): Promise<OrderTotals> {
    const subtotal = this.calculateSubtotal(context);
    const discount = this.calculateDiscount(context);
    const shipping = this.calculateShipping(context);
    const tax = this.calculateTax(subtotal);
    const grandTotal = this.calculateGrandTotal(subtotal, discount, shipping, tax);

    return { subtotal, discount, shipping, tax, grandTotal };
  }

  private calculateSubtotal(context: CartCheckoutContext): Money {
    const total = context.items.reduce((sum, item) => sum + item.subtotal.amount, 0);
    return { amount: Math.round(total * 100) / 100, currency: context.currency };
  }

  private calculateDiscount(_context: CartCheckoutContext): Money {
    return { amount: 0, currency: 'INR' };
  }

  private calculateShipping(context: CartCheckoutContext): Money {
    return { ...context.totals.shipping };
  }

  private calculateTax(subtotal: Money): Money {
    const taxRate = 0.05;
    return {
      amount: Math.round(subtotal.amount * taxRate * 100) / 100,
      currency: subtotal.currency,
    };
  }

  private calculateGrandTotal(
    subtotal: Money,
    discount: Money,
    shipping: Money,
    tax: Money,
  ): Money {
    const total = subtotal.amount - discount.amount + shipping.amount + tax.amount;
    return { amount: Math.round(Math.max(0, total) * 100) / 100, currency: subtotal.currency };
  }
}
