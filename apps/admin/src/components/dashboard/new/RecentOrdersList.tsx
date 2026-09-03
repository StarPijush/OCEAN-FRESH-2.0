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
        background: '#FFFFFF',
        border: '1px solid rgba(11,19,15,0.06)',
        borderRadius: 24,
        padding: '1.75rem',
        boxShadow: '0 10px 30px rgba(11,19,15,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0B130F',
              letterSpacing: '-0.025em',
            }}
          >
            Recent Orders
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              color: '#6C7E75',
            }}
          >
            Latest customer orders
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          style={{
            padding: '6px 14px',
            height: 32,
            background: '#F8FAF9',
            border: '1px solid rgba(11,19,15,0.08)',
            borderRadius: 9999,
            color: '#0B130F',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 150ms var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d2035';
            (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(11,19,15,0.08)';
            (e.currentTarget as HTMLButtonElement).style.background = '#F8FAF9';
          }}
        >
          View All
        </button>
      </div>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 62,
                borderRadius: 14,
                background: '#F8FAF9',
                border: '1px solid rgba(11,19,15,0.06)',
                animation: 'pulse 1.2s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : !recent.length ? (
        <div
          style={{
            padding: '20px 0',
            textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#6C7E75',
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 8, opacity: 0.5 }}>📦</div>
          No orders yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recent.map((order, idx) => (
            <div
              key={order.id}
              onClick={() => navigate('/orders')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                padding: '14px 10px',
                background: '#F8FAF9',
                borderRadius: 14,
                border: '1px solid transparent',
                marginBottom: idx === recent.length - 1 ? 0 : 2,
                cursor: 'pointer',
                transition: 'all 150ms var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,19,15,0.06)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 2px 8px rgba(11,19,15,0.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#F8FAF9';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0B130F',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {order.orderNumber}
                  </span>
                  <span style={{ color: '#6C7E75', fontSize: 11, opacity: 0.6 }}>→</span>
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12,
                    color: '#6C7E75',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.customerSnapshot?.name ?? 'Guest'}
                </span>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 11,
                    color: '#879A91',
                    letterSpacing: '0.02em',
                  }}
                >
                  {formatOrderTime(order)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 6,
                  minWidth: 105,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0B130F',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatCurrency(order.totals?.grandTotal?.amount ?? 0)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
