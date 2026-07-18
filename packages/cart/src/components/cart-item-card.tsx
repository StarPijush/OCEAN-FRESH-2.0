import type { CartItem } from '@oceanfresh/shared';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
  readonly?: boolean;
  className?: string;
}

function formatMoney(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove, readonly = false, className = '' }: CartItemCardProps) {
  return (
    <div className={`flex gap-4 py-4 border-b border-gray-100 last:border-b-0 ${className}`} role="listitem">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        {item.snapshot.thumbnail ? (
          <img
            src={item.snapshot.thumbnail}
            alt={item.snapshot.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{item.snapshot.name}</h4>
            {item.snapshot.variantSummary && (
              <p className="mt-0.5 text-xs text-gray-500">{item.snapshot.variantSummary}</p>
            )}
            <p className="mt-0.5 text-sm text-gray-700">{formatMoney(item.snapshot.price.amount)} / {item.snapshot.unit}</p>
          </div>
          <p className="text-sm font-medium text-gray-900">{formatMoney(item.subtotal.amount)}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          {readonly ? (
            <span className="text-sm text-gray-600">Qty: {item.quantity.value}</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity?.(item.id, Math.max(1, item.quantity.value - 1))}
                className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{item.quantity.value}</span>
              <button
                onClick={() => onUpdateQuantity?.(item.id, item.quantity.value + 1)}
                className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}

          {!readonly && onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="text-sm text-red-500 hover:text-red-700"
              aria-label={`Remove ${item.snapshot.name}`}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
