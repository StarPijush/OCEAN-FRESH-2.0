import { type Order, OrderStatus } from '@oceanfresh/shared';
import { useDeferredValue, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { useOrderCounts, useOrders, useUpdateOrderStatus } from '../hooks/use-orders';
import { colors, radius, spacing } from '../theme';
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

export function OrdersScreen() {
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

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by order number, name or phone…"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const count = tabCount(t);
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && styles.tabActive]}
              >
                <AppText variant="label" color={tab === t ? 'bg' : 'mutedBright'}>
                  {t}
                </AppText>
                {count !== undefined && count > 0 ? (
                  <View style={[styles.badge, tab === t && styles.badgeActive]}>
                    <AppText variant="caption" color={tab === t ? 'bg' : 'aqua'}>
                      {count}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState message={error?.message ?? null} onRetry={refetch} />
      ) : shown.length === 0 ? (
        <EmptyState title="No orders" hint="Orders in this bucket will appear here." />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const expanded = expandedId === item.id;
            const next = NEXT_MOVE[item.status];
            return (
              <Card style={styles.card}>
                <Pressable onPress={() => setExpandedId(expanded ? null : item.id)}>
                  <View style={styles.row}>
                    <View style={styles.meta}>
                      <AppText variant="bodySemiBold">{item.orderNumber}</AppText>
                      <AppText variant="caption" color="muted">
                        {item.customerSnapshot?.name ?? 'Guest'} ·{' '}
                        {formatDate(new Date(item.createdAt).getTime())} ·{' '}
                        {formatTime(new Date(item.createdAt).getTime())}
                      </AppText>
                    </View>
                    <View style={styles.right}>
                      <AppText variant="bodyMedium">
                        {formatCurrency(item.totals?.grandTotal?.amount ?? 0)}
                      </AppText>
                      <StatusBadge status={item.status} />
                    </View>
                  </View>
                </Pressable>

                {expanded ? (
                  <View style={styles.details}>
                    <AppText variant="caption" color="muted">
                      {item.customerSnapshot?.name} · {item.customerSnapshot?.phone}
                      {'\n'}
                      {item.shippingSnapshot?.address}, {item.shippingSnapshot?.city}{' '}
                      {item.shippingSnapshot?.pincode}
                    </AppText>
                    <View style={styles.items}>
                      {item.items?.map((line) => (
                        <View key={line.id} style={styles.itemRow}>
                          <AppText variant="body" numberOfLines={1} style={{ flex: 1 }}>
                            {line.quantity} × {line.snapshot?.name}
                          </AppText>
                          <AppText variant="bodyMedium">
                            {formatCurrency(line.subtotal?.amount ?? 0)}
                          </AppText>
                        </View>
                      ))}
                    </View>
                    {next ? (
                      <Button
                        label={`Advance to ${next.replace('_', ' ').toLowerCase()}`}
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
                  </View>
                ) : null}
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  toolbar: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    color: colors.cream,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  tabActive: { backgroundColor: colors.aqua, borderColor: colors.aqua },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.aquaDim,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: 'rgba(13,15,18,0.25)' },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { flex: 1, gap: 2, paddingRight: spacing.md },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  details: { gap: spacing.md, paddingTop: spacing.sm },
  items: { gap: spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
});
