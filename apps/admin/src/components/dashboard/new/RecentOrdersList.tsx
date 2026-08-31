import type { Order } from '@oceanfresh/shared';
import { useNavigate } from 'react-router-dom';

import { StatusBadge } from '../../../components/StatusBadge';
import { formatCurrency, formatTime } from '../../../utils/format';

interface Props {
  orders: Order[];
  isLoading: boolean;
  onViewAll: () => void;
}

function toDateSafe(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
function formatOrderTime(order: Order): string {
  const d = toDateSafe((order as unknown as Record<string, unknown>).createdAt);
  return d ? formatTime(d.getTime()) : 'Unknown time';
}

export function RecentOrdersList({ orders, isLoading, onViewAll }: Props) {
  const navigate = useNavigate();
  const recent = orders.slice(0, 5);
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 400,
              color: 'var(--color-cream)',
              letterSpacing: '-0.02em',
            }}
          >
            Recent Orders
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-muted2)' }}>Latest customer orders</span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          style={{
            padding: '6px 12px',
            height: 32,
            background: 'transparent',
            border: '1px solid var(--color-border2)',
            borderRadius: 20,
            color: 'var(--color-aqua)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View All
        </button>
      </div>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 56,
                borderRadius: 8,
                background:
                  'linear-gradient(90deg, var(--color-surface2) 25%, var(--color-border) 50%, var(--color-surface2) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : !recent.length ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-muted2)' }}>
          No orders yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
          {recent.map((order, idx) => (
            <button
              key={order.id}
              type="button"
              onClick={() => navigate('/orders')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                padding: '14px 0',
                borderBottom: idx === recent.length - 1 ? 'none' : '1px solid var(--color-border)',
                background: 'transparent',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-cream)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {order.orderNumber}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
                  {order.customerSnapshot?.name ?? 'Guest'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)', opacity: 0.9 }}>
                  {formatOrderTime(order)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 6,
                  minWidth: 88,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-cream)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCurrency(order.totals?.grandTotal?.amount ?? 0)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
