import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { useAdminSession } from '../hooks/use-auth-session';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { useOrders } from '../hooks/use-orders';
import { useAdminProfile } from '../hooks/use-settings';
import { colors, radius, spacing } from '../theme';
import { formatCurrency, formatTime } from '../utils/format';

export function DashboardScreen() {
  const session = useAdminSession();
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();
  const { data: profile } = useAdminProfile(session.user?.id);
  const orders = useOrders({ limit: 8 });
  const { refetch: refetchOrders } = orders;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchOrders()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchOrders]);

  if (isLoading) return <LoadingState label="Loading overview…" />;
  if (isError || !stats) return <ErrorState message={error?.message ?? null} onRetry={refetch} />;

  const maxDay = Math.max(...stats.revenueByDay.map((d) => d.value), 1);

  return (
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={() => (
        <View style={styles.content}>
          <View style={styles.welcome}>
            <AppText variant="heading">
              Hello, {profile?.fullName?.split(' ')[0] ?? 'Admin'}
            </AppText>
            <AppText variant="body" color="mutedBright">
              {"Here's your store at a glance."}
            </AppText>
          </View>

          <View style={styles.tiles}>
            <StatCard label="Revenue" value={formatCurrency(stats.revenueTotal)} tone="aqua" />
            <StatCard label="Orders" value={String(stats.ordersCount)} tone="green" />
            <StatCard label="Pending" value={String(stats.pendingCount)} tone="gold" />
            <StatCard label="Live products" value={String(stats.productsOnline)} tone="muted" />
          </View>

          <Card>
            <AppText variant="title">Revenue — last 7 days</AppText>
            <View style={styles.chart}>
              {stats.revenueByDay.map((day) => (
                <View key={day.label} style={styles.chartCol}>
                  <AppText variant="caption" color="muted" style={styles.chartValue}>
                    {day.value > 0 ? `₹${Math.round(day.value / 1000)}k` : ''}
                  </AppText>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: Math.max(4, (day.value / maxDay) * 96),
                        backgroundColor: day.value > 0 ? colors.aqua : colors.borderStrong,
                      },
                    ]}
                  />
                  <AppText variant="caption" color="muted" style={styles.chartLabel}>
                    {day.label}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <AppText variant="title">Recent orders</AppText>
            {orders.isLoading ? (
              <LoadingState label="Loading orders…" />
            ) : orders.data?.items.length ? (
              <View style={styles.orderList}>
                {orders.data.items.slice(0, 8).map((order) => (
                  <View key={order.id} style={styles.orderRow}>
                    <View style={styles.orderMeta}>
                      <AppText variant="bodyMedium">{order.orderNumber}</AppText>
                      <AppText variant="caption" color="muted">
                        {formatTime(new Date(order.createdAt).getTime())} ·{' '}
                        {order.customerSnapshot?.name ?? 'Guest'}
                      </AppText>
                    </View>
                    <View style={styles.orderRight}>
                      <AppText variant="bodyMedium">
                        {formatCurrency(order.totals?.grandTotal?.amount ?? 0)}
                      </AppText>
                      <StatusBadge status={order.status} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState title="No orders yet" hint="New orders will appear here." />
            )}
          </Card>

          <Card>
            <AppText variant="title">Inventory health</AppText>
            <View style={styles.healthRow}>
              <HealthItem label="Out of stock" value={stats.outOfStock} tone="warn" />
              <HealthItem label="Low stock (≤5)" value={stats.lowStock} tone="gold" />
              <HealthItem
                label="Avg order value"
                value={formatCurrency(stats.avgOrderValue)}
                tone="aqua"
              />
            </View>
          </Card>
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.aqua} />
      }
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

function HealthItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'warn' | 'gold' | 'aqua';
}) {
  const color = tone === 'warn' ? colors.warn : tone === 'gold' ? colors.gold : colors.aqua;
  return (
    <View style={styles.healthItem}>
      <AppText variant="bodySemiBold" style={{ color }}>
        {value}
      </AppText>
      <AppText variant="caption" color="muted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  content: { gap: spacing.lg },
  welcome: { gap: spacing.xs },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
    height: 128,
  },
  chartCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  chartValue: { height: 16 },
  chartBar: { width: '70%', borderRadius: radius.sm },
  chartLabel: { marginTop: 2 },
  orderList: { gap: spacing.md, marginTop: spacing.lg },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  orderMeta: { gap: 2, flex: 1 },
  orderRight: { alignItems: 'flex-end', gap: spacing.xs },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  healthItem: { alignItems: 'center', gap: 2, flex: 1 },
});
