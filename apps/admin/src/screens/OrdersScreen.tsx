import { type Order, OrderStatus } from '@oceanfresh/shared';
import { useDeferredValue, useState } from 'react';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FilterChip } from '../components/FilterChip';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/SearchInput';
import { Skeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { useOrderCounts, useOrders, useUpdateOrderStatus } from '../hooks/use-orders';
import { breakpoints, colors, radius, spacing } from '../theme';
import { errorToMessage } from '../utils/error';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

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
      return order.status === tab;
  }
}

function OrderCardSkeleton() {
  return (
    <Card>
      <Skeleton width="45%" height={16} />
      <Skeleton width="30%" height={12} style={{ marginTop: spacing.sm }} />
      <Skeleton width="60%" height={14} style={{ marginTop: spacing.md }} />
    </Card>
  );
}

export function OrdersScreen() {
  const { width } = useBreakpoint();
  const isDesktop = width >= breakpoints.desktop;
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

  const rootStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: colors.bg,
    minHeight: '100%',
  };

  const gridStyle: React.CSSProperties = isDesktop
    ? { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: spacing.md }
    : { display: 'flex', flexDirection: 'column', gap: spacing.md };

  return (
    <div style={rootStyle}>
      <div
        style={{
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingTop: spacing.lg,
          gap: spacing.md,
          paddingBottom: spacing.sm,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeader title="Orders" subtitle="Track, confirm and advance customer orders." />
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by order number, name or phone…"
        />
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {TABS.map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={tab === t}
              count={tabCount(t)}
              onPress={() => setTab(t)}
            />
          ))}
        </div>
      </div>

      {isLoading ? (
        <div
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={
                isDesktop
                  ? {
                      width: '50%',
                      paddingLeft: spacing.xs,
                      paddingRight: spacing.xs,
                      paddingBottom: spacing.md,
                    }
                  : { width: '100%', paddingBottom: spacing.md }
              }
            >
              <OrderCardSkeleton />
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <div style={{ padding: spacing.lg }}>
          <ErrorState message={errorToMessage(error)} onRetry={refetch} />
        </div>
      ) : shown.length === 0 ? (
        <div style={{ padding: spacing.lg }}>
          <EmptyState
            title={query ? 'No orders found' : 'No orders yet'}
            hint={
              query
                ? 'Try a different search term or status.'
                : 'Orders placed on the storefront will appear here.'
            }
          />
        </div>
      ) : (
        <div style={{ padding: spacing.lg, ...gridStyle }}>
          {shown.map((item) => {
            const expanded = expandedId === item.id;
            const next = NEXT_MOVE[item.status];
            const itemCount = item.items?.length ?? 0;
            const address = item.shippingSnapshot;
            const paid = item.payment?.paidAmount?.amount ?? null;
            return (
              <Card
                key={item.id}
                style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}
              >
                <button
                  type="button"
                  className="of-btn"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  aria-expanded={expanded}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: spacing.md,
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      gap: 3,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                        flexWrap: 'wrap',
                      }}
                    >
                      <AppText variant="bodySemiBold" color="cream">
                        {item.orderNumber}
                      </AppText>
                      <StatusBadge status={item.status} />
                    </div>
                    <AppText variant="caption" color="muted" numberOfLines={1}>
                      {item.customerSnapshot?.name ?? 'Guest'}
                      {item.customerSnapshot?.phone ? ` · ${item.customerSnapshot.phone}` : ''}
                    </AppText>
                    <AppText variant="caption" color="muted">
                      {formatDate(new Date(item.createdAt).getTime())} ·{' '}
                      {formatTime(new Date(item.createdAt).getTime())} · {itemCount} item
                      {itemCount !== 1 ? 's' : ''}
                    </AppText>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: spacing.xs,
                    }}
                  >
                    <AppText variant="bodyMedium" color="cream">
                      {formatCurrency(item.totals?.grandTotal?.amount ?? 0)}
                    </AppText>
                    <Icon
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.muted}
                    />
                  </div>
                </button>

                {expanded ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing.md,
                      paddingTop: spacing.md,
                      borderTop: `1px solid ${colors.border}`,
                    }}
                  >
                    {handleStatusError ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.sm,
                          backgroundColor: colors.warnDim,
                          border: `1px solid ${colors.warn}`,
                          borderRadius: radius.md,
                          padding: spacing.md,
                        }}
                      >
                        <Icon name="alert-circle" size={16} color={colors.warn} />
                        <AppText variant="caption" color="warn" style={{ flex: 1, lineHeight: 18 }}>
                          {handleStatusError}
                        </AppText>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <AppText
                        variant="caption"
                        color="muted"
                        style={{ letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}
                      >
                        CUSTOMER
                      </AppText>
                      <AppText variant="body">
                        {item.customerSnapshot?.name ?? 'Guest'}
                        {item.customerSnapshot?.phone ? ` · ${item.customerSnapshot.phone}` : ''}
                      </AppText>
                      {address ? (
                        <AppText variant="caption" color="muted" style={{ lineHeight: 18 }}>
                          {address.address}
                          {address.city ? `, ${address.city}` : ''}
                          {address.pincode ? ` ${address.pincode}` : ''}
                        </AppText>
                      ) : null}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <AppText
                        variant="caption"
                        color="muted"
                        style={{ letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}
                      >
                        ITEMS
                      </AppText>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                        {item.items?.map((line) => (
                          <div
                            key={line.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              gap: spacing.md,
                            }}
                          >
                            <AppText
                              variant="body"
                              numberOfLines={1}
                              style={{ flex: 1, minWidth: 0 }}
                            >
                              {line.quantity} × {line.snapshot?.name}
                            </AppText>
                            <AppText variant="bodyMedium">
                              {formatCurrency(line.subtotal?.amount ?? 0)}
                            </AppText>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          marginTop: spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: spacing.md,
                          }}
                        >
                          <AppText variant="caption" color="muted">
                            Subtotal
                          </AppText>
                          <AppText variant="caption" color="mutedBright">
                            {formatCurrency(item.totals?.subtotal?.amount ?? 0)}
                          </AppText>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: spacing.md,
                          }}
                        >
                          <AppText variant="caption" color="muted">
                            Delivery
                          </AppText>
                          <AppText variant="caption" color="mutedBright">
                            {formatCurrency(item.totals?.shipping?.amount ?? 0)}
                          </AppText>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: spacing.md,
                            borderTop: `1px solid ${colors.border}`,
                            paddingTop: spacing.sm,
                            marginTop: spacing.xs,
                          }}
                        >
                          <AppText variant="bodySemiBold">Total</AppText>
                          <AppText variant="bodySemiBold">
                            {formatCurrency(item.totals?.grandTotal?.amount ?? 0)}
                          </AppText>
                        </div>
                      </div>
                    </div>

                    {item.payment?.method ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <AppText
                          variant="caption"
                          color="muted"
                          style={{
                            letterSpacing: 1.4,
                            textTransform: 'uppercase',
                            marginBottom: 2,
                          }}
                        >
                          PAYMENT
                        </AppText>
                        <AppText variant="caption" color="mutedBright">
                          {item.payment.method}
                          {paid != null ? ` · ${formatCurrency(paid)}` : ''}
                        </AppText>
                      </div>
                    ) : null}

                    {next ? (
                      <Button
                        label={`Advance to ${next.replace(/_/g, ' ').toLowerCase()}`}
                        variant="primary"
                        loading={updateStatus.isPending && updateStatus.variables?.id === item.id}
                        onPress={() =>
                          updateStatus.mutate({
                            id: item.id,
                            status: next,
                            changedBy: 'admin',
                          })
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
