import type { CartTotals } from '@oceanfresh/shared';

interface CartSummaryProps {
  totals: CartTotals;
  itemCount: number;
  className?: string;
}

function formatMoney(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function CartSummary({ totals, itemCount, className = '' }: CartSummaryProps) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`} aria-label="Cart summary">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cart Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Items ({itemCount})</span>
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
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatMoney(totals.grandTotal.amount)}</span>
        </div>
      </div>
    </section>
  );
}
