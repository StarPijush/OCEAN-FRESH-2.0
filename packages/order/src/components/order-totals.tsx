import type { OrderTotals as OrderTotalsType } from '@oceanfresh/shared';

interface OrderTotalsProps {
  totals: OrderTotalsType;
  className?: string;
}

function formatMoney(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function OrderTotals({ totals, className = '' }: OrderTotalsProps) {
  return (
    <div className={`space-y-1 text-sm ${className}`}>
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>{formatMoney(totals.subtotal.amount)}</span>
      </div>

      <div className="flex justify-between text-gray-600">
        <span>Shipping</span>
        <span>
          {totals.shipping.amount === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            formatMoney(totals.shipping.amount)
          )}
        </span>
      </div>

      <div className="flex justify-between text-gray-600">
        <span>Tax</span>
        <span>{formatMoney(totals.tax.amount)}</span>
      </div>

      {totals.discount.amount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{formatMoney(totals.discount.amount)}</span>
        </div>
      )}

      <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
        <span>Total</span>
        <span>{formatMoney(totals.grandTotal.amount)}</span>
      </div>
    </div>
  );
}
