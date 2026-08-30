interface OrderSummaryProps {
  subtotal: number;
  deliveryAmt: number;
  total: number;
  freeDeliveryAbove?: number | null;
}

export function OrderSummary({
  subtotal,
  deliveryAmt,
  total,
  freeDeliveryAbove,
}: OrderSummaryProps) {
  const hasThreshold = typeof freeDeliveryAbove === 'number' && freeDeliveryAbove > 0;
  const progress = hasThreshold
    ? Math.min(100, (subtotal / (freeDeliveryAbove as number)) * 100)
    : 0;
  const remaining = hasThreshold ? Math.max(0, (freeDeliveryAbove as number) - subtotal) : 0;
  const unlocked = hasThreshold && subtotal >= (freeDeliveryAbove as number);

  return (
    <div className="order-summary-card" aria-label="Order summary">
      <div className="order-summary-row">
        <span className="order-summary-label">Subtotal</span>
        <span className="order-summary-value" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ₹{subtotal}
        </span>
      </div>

      <div className="order-summary-row">
        <span className="order-summary-label">Delivery</span>
        <span
          className={deliveryAmt > 0 ? 'order-summary-value' : 'order-summary-value free'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {deliveryAmt > 0 ? `₹${deliveryAmt}` : 'Free'}
        </span>
      </div>

      {hasThreshold ? (
        <div className="order-summary-progress" role="status" aria-live="polite">
          <div className="order-summary-progress-track" aria-hidden="true">
            <div className="order-summary-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="order-summary-progress-text">
            {unlocked ? (
              <span className="free">FREE DELIVERY UNLOCKED</span>
            ) : (
              <>₹{remaining} away from free delivery</>
            )}
          </p>
        </div>
      ) : null}

      <div className="order-summary-divider" role="separator" />

      <div className="order-summary-row order-summary-row--total">
        <span className="order-summary-label">Total</span>
        <span className="order-summary-value" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ₹{total}
        </span>
      </div>
    </div>
  );
}
