import { type Order, OrderStatus } from '@oceanfresh/shared';
import { useDeferredValue, useState } from 'react';

import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/new/Button';
import { Chip } from '../../components/ui/new/Chip';
import { Input } from '../../components/ui/new/Input';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useOrderCounts, useOrders, useUpdateOrderStatus } from '../../hooks/use-orders';
import { errorToMessage } from '../../utils/error';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';

const TABS = ['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as const;
type Tab = (typeof TABS)[number];
const PENDING_GROUP: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAYMENT_FAILED,
  OrderStatus.VALIDATING,
  OrderStatus.CONFIRMED,
];
const NEXT_MOVE: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING_PAYMENT]: OrderStatus.PAID,
  [OrderStatus.PAYMENT_FAILED]: OrderStatus.PENDING_PAYMENT,
  [OrderStatus.VALIDATING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.PACKED,
  [OrderStatus.PACKED]: OrderStatus.SHIPPED,
  [OrderStatus.SHIPPED]: OrderStatus.OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.DELIVERED,
};
function matchesTab(order: Order, tab: Tab): boolean {
  switch (tab) {
    case 'ALL':
      return true;
    case 'PENDING':
      return PENDING_GROUP.includes(order.status);
    default:
      return order.status === (tab as unknown as OrderStatus);
  }
}

export function OrdersScreen() {
  const { width } = useBreakpoint();
  const isDesktop = width >= 1024;
  const [tab, setTab] = useState<Tab>('ALL');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useOrders({ limit: 100 });
  const counts = useOrderCounts();
  const updateStatus = useUpdateOrderStatus();
  const query = deferredSearch.trim().toLowerCase();
  const shown = (data?.items ?? []).filter(
    (o) =>
      matchesTab(o, tab) &&
      (!query ||
        o.orderNumber.toLowerCase().includes(query) ||
        (o.customerSnapshot?.name ?? '').toLowerCase().includes(query) ||
        (o.customerSnapshot?.phone ?? '').includes(query)),
  );
  const tabCount = (t: Tab): number | undefined => {
    if (t === 'ALL') return counts.data?.total;
    if (t === 'PENDING') return counts.data?.pending;
    return undefined;
  };
  const handleStatusError = updateStatus.error ? errorToMessage(updateStatus.error) : null;
  function toDateSafe(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value as string);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }
  return (
    <div style={{ flex: 1, background: '#F4F6F5', minHeight: '100%' }}>
      <div style={{ padding: '32px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#0B130F',
              lineHeight: 1.2,
            }}
          >
            Orders
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              color: '#6C7E75',
              marginTop: 4,
            }}
          >
            Track, confirm and advance customer orders.
          </div>
        </div>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(11,19,15,0.06)',
            borderRadius: 18,
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number, name or phone…"
              leftElement={<span style={{ color: '#6C7E75', fontSize: 14 }}>⌕</span>}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TABS.map((t) => (
              <Chip
                key={t}
                variant={tab === t ? 'active' : 'default'}
                onClick={() => setTab(t)}
                count={tabCount(t)}
              >
                {t}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            padding: '0 24px 24px',
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(2,1fr)' : '1fr',
            gap: 12,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 128,
                borderRadius: 18,
                background: '#FFFFFF',
                border: '1px solid rgba(11,19,15,0.06)',
                boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : isError || !data ? (
        <div style={{ padding: 24 }}>
          <div
            style={{
              color: '#EF4444',
              marginBottom: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {errorToMessage(error)}
          </div>
          <Button variant="ghost" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : shown.length === 0 ? (
        <div
          style={{
            margin: '0 24px 24px',
            padding: 40,
            textAlign: 'center',
            color: '#879A91',
            background: '#FFFFFF',
            border: '1px solid rgba(11,19,15,0.06)',
            borderRadius: 18,
            boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#0B130F',
            }}
          >
            {query ? 'No orders found' : 'No orders yet'}
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              color: '#6C7E75',
              marginTop: 6,
            }}
          >
            {query
              ? 'Try a different search term or status.'
              : 'Orders placed on the storefront will appear here.'}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '0 24px 24px',
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(2,1fr)' : '1fr',
            gap: 12,
          }}
        >
          {shown.map((item) => {
            const expanded = expandedId === item.id;
            const next = NEXT_MOVE[item.status];
            const itemCount = item.items?.length ?? 0;
            const address = item.shippingSnapshot as unknown as
              { address?: string; city?: string; pincode?: string } | undefined;
            const paid =
              (item as unknown as { payment?: { paidAmount?: { amount?: number } } }).payment
                ?.paidAmount?.amount ?? null;
            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(11,19,15,0.06)',
                  borderRadius: 18,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
                  transition: 'box-shadow 150ms ease, border-color 150ms ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  aria-expanded={expanded}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                    >
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          color: '#0B130F',
                        }}
                      >
                        {item.orderNumber}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 12,
                        color: '#6C7E75',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.customerSnapshot?.name ?? 'Guest'}
                      {item.customerSnapshot?.phone ? ` · ${item.customerSnapshot.phone}` : ''}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 11,
                        color: '#879A91',
                      }}
                    >
                      {(() => {
                        const d = toDateSafe(
                          (item as unknown as Record<string, unknown>).createdAt,
                        );
                        return d
                          ? `${formatDate(d.getTime())} · ${formatTime(d.getTime())}`
                          : 'Unknown time';
                      })()}{' '}
                      · {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0B130F',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCurrency(item.totals?.grandTotal?.amount ?? 0)}
                    </span>
                    <span style={{ fontSize: 12, color: '#6C7E75' }}>{expanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      paddingTop: 16,
                      borderTop: '1px solid rgba(11,19,15,0.06)',
                      marginTop: 4,
                    }}
                  >
                    {handleStatusError ? (
                      <div
                        style={{
                          padding: 12,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.14)',
                          borderRadius: 10,
                          color: '#EF4444',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 13,
                        }}
                      >
                        {handleStatusError}
                      </div>
                    ) : null}

                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          color: 'var(--color-muted)',
                          marginBottom: 4,
                        }}
                      >
                        Customer
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-cream)', fontWeight: 500 }}>
                        {item.customerSnapshot?.name ?? 'Guest'}
                        {item.customerSnapshot?.phone ? ` · ${item.customerSnapshot.phone}` : ''}
                      </div>
                      {address ? (
                        <div
                          style={{ fontSize: 12, color: 'var(--color-muted2)', lineHeight: 1.6 }}
                        >
                          {address.address}
                          {address.city ? `, ${address.city}` : ''}
                          {address.pincode ? ` ${address.pincode}` : ''}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          color: 'var(--color-muted)',
                          marginBottom: 6,
                        }}
                      >
                        Items
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {item.items?.map((line) => {
                          const wd = (line as unknown as Record<string, unknown>).weightDisplay as
                            string | undefined;
                          const wg = (line as unknown as Record<string, unknown>).weightGrams as
                            number | undefined;
                          const weightLabel = wd ? wd : wg ? `${wg}g` : `${line.quantity}`;
                          return (
                            <div
                              key={line.id}
                              style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
                            >
                              <span style={{ fontSize: 13, color: 'var(--color-cream)', flex: 1 }}>
                                {weightLabel} × {line.snapshot?.name}
                                <span
                                  style={{
                                    marginLeft: 6,
                                    fontSize: 11,
                                    color: '#6C7E75',
                                    fontWeight: 500,
                                  }}
                                >
                                  Weight: {weightLabel}
                                </span>
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: 'var(--color-cream)',
                                  fontWeight: 600,
                                }}
                              >
                                {formatCurrency(line.subtotal?.amount ?? 0)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          borderTop: '1px solid var(--color-border)',
                          paddingTop: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            color: 'var(--color-muted2)',
                          }}
                        >
                          <span>Subtotal</span>
                          <span>{formatCurrency(item.totals?.subtotal?.amount ?? 0)}</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            color: 'var(--color-muted2)',
                          }}
                        >
                          <span>Delivery</span>
                          <span>{formatCurrency(item.totals?.shipping?.amount ?? 0)}</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--color-cream)',
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: 8,
                            marginTop: 4,
                          }}
                        >
                          <span>Total</span>
                          <span>{formatCurrency(item.totals?.grandTotal?.amount ?? 0)}</span>
                        </div>
                      </div>
                    </div>

                    {(item as unknown as { payment?: { method?: string } }).payment?.method ? (
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            letterSpacing: 1.2,
                            textTransform: 'uppercase',
                            color: 'var(--color-muted)',
                            marginBottom: 4,
                          }}
                        >
                          Payment
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
                          {(item as unknown as { payment: { method: string } }).payment.method}
                          {paid != null ? ` · ${formatCurrency(paid)}` : ''}
                        </div>
                      </div>
                    ) : null}

                    {next ? (
                      <Button
                        variant="primary"
                        loading={
                          updateStatus.isPending &&
                          (updateStatus.variables as unknown as { id: string })?.id === item.id
                        }
                        onClick={() =>
                          updateStatus.mutate({ id: item.id, status: next, changedBy: 'admin' })
                        }
                      >
                        Advance to {next.replace(/_/g, ' ').toLowerCase()}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
