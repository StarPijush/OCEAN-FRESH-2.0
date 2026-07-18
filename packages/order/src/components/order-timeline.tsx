import type { OrderTimelineEntry } from '@oceanfresh/shared';
import { OrderStatusBadge } from './order-status-badge.js';

interface OrderTimelineProps {
  timeline: OrderTimelineEntry[];
  className?: string;
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderTimeline({ timeline, className = '' }: OrderTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No status history available
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} role="list" aria-label="Order timeline">
      {timeline.map((entry, index) => (
        <div key={index} className="flex gap-3" role="listitem">
          <div className="flex flex-col items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            {index < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
          </div>

          <div className="flex-1 pb-3">
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={entry.status} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{formatDateTime(entry.timestamp)}</p>
            {entry.changedBy && (
              <p className="text-xs text-gray-400">by {entry.changedBy}</p>
            )}
            {entry.note && (
              <p className="mt-1 text-sm text-gray-600">{entry.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
