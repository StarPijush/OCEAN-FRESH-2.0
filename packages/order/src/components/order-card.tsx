import type { Order } from '@oceanfresh/shared';

import { OrderStatusBadge } from './order-status-badge.js';

interface OrderCardProps {
  order: Order;
  onSelect?: (order: Order) => void;
  className?: string;
}

function formatMoney(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function OrderCard({ order, onSelect, className = '' }: OrderCardProps) {
  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
      role="article"
      aria-label={`Order ${order.orderNumber}`}
    >
      {onSelect && (
        <button
          onClick={() => onSelect(order)}
          className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
          aria-label={`View order ${order.orderNumber}`}
        />
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-900">{order.orderNumber}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>
          {order.customerSnapshot.name} • {order.customerSnapshot.phone}
        </p>
        <p>
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">{order.orderNumber}</span>
        <span className="text-sm font-semibold text-gray-900">
          {formatMoney(order.totals.grandTotal.amount)}
        </span>
      </div>
    </article>
  );
}
