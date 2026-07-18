import type { OrderStatus } from '@oceanfresh/shared';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  validating: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  payment_failed: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-cyan-100 text-cyan-700',
  shipped: 'bg-teal-100 text-teal-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  refund_requested: 'bg-pink-100 text-pink-700',
  refunded: 'bg-pink-100 text-pink-700',
  archived: 'bg-gray-100 text-gray-400',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}>
      {formatStatus(status)}
    </span>
  );
}
