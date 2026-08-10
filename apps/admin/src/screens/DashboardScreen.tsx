import type { DrawerScreenProps } from '@react-navigation/drawer';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { useAdminSession } from '../hooks/use-auth-session';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { useOrders } from '../hooks/use-orders';
import { useAdminProfile } from '../hooks/use-settings';
import type { AdminDrawerParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatCurrency, formatTime } from '../utils/format';

type Props = DrawerScreenProps<AdminDrawerParamList, 'Dashboard'>;

type ChartMode = 'income' | 'sales';

export function DashboardScreen({ navigation }: Props) {
  const session = useAdminSession();
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();
  const { data: profile } = useAdminProfile(session.user?.id);
  const orders = useOrders({ limit: 8 });
  const { refetch: refetchOrders } = orders;
  const [chartMode, setChartMode] = useState<ChartMode>('income');
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

  const maxDay = Math.max(
    ...stats.chart.map((d) => (chartMode === 'income' ? d.income : d.sales)),
    1,
  );

  const recentOrders = orders.isLoading ? [] : (orders.data?.items ?? []).slice(0, 5);

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
              {"Your shop at a glance — today's performance and trends."}
            </AppText>
          </View>

          {/* Stat cards */}
          <View style={styles.tiles}>
            <StatCard label="Today's Sales" value={String(stats.todaySales)} tone="aqua" />
            <StatCard
              label="Today's Income"
              value={formatCurrency(stats.todayIncome)}
              tone="green"
            />
            <StatCard label="This Week" value={formatCurrency(stats.weekIncome)} tone="gold" />
            <StatCard label="Pending Orders" value={String(stats.pendingOrders)} tone="warn" />
            <StatCard label="Total Orders" value={String(stats.totalOrders)} tone="muted" />
            <StatCard
              label="Total Revenue"
              value={formatCurrency(stats.totalIncome)}
              tone="green"
            />
            <StatCard
              label="Products Active"
              value={`${stats.availableProducts} / ${stats.totalProducts}`}
              tone="aqua"
            />
          </View>

          {/* 7-day chart */}
          <Card>
            <View style={styles.chartHead}>
              <AppText variant="title">7-Day Performance</AppText>
              <View style={styles.toggle}>
                {(['income', 'sales'] as const).map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => setChartMode(mode)}
                    style={[styles.toggleBtn, chartMode === mode && styles.toggleBtnActive]}
                  >
                    <AppText variant="label" color={chartMode === mode ? 'bg' : 'mutedBright'}>
                      {mode === 'income' ? 'Income' : 'Sales'}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.chart}>
              {stats.chart.map((day) => {
                const value = chartMode === 'income' ? day.income : day.sales;
                const pct = maxDay > 0 ? (value / maxDay) * 96 : 0;
                return (
                  <View key={day.label} style={styles.chartCol}>
                    <AppText variant="caption" color="muted" style={styles.chartValue}>
                      {value > 0
                        ? chartMode === 'income'
                          ? `₹${Math.round(value / 1000)}k`
                          : String(value)
                        : ''}
                    </AppText>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: Math.max(4, pct),
                          backgroundColor: value > 0 ? colors.aqua : colors.borderStrong,
                        },
                      ]}
                    />
                    <AppText variant="caption" color="muted" style={styles.chartLabel}>
                      {day.label}
                    </AppText>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Top products */}
          <Card>
            <AppText variant="title">Top Products · This Month</AppText>
            {stats.topProducts.length ? (
              <View style={styles.topList}>
                {stats.topProducts.map((p, i) => {
                  const max = stats.topProducts[0]?.qty ?? 1;
                  return (
                    <View key={p.name} style={styles.topRow}>
                      <AppText variant="label" color="muted" style={styles.topRank}>
                        {i + 1}
                      </AppText>
                      <AppText variant="bodyMedium" numberOfLines={1} style={styles.topName}>
                        {p.name}
                      </AppText>
                      <View style={styles.topBarWrap}>
                        <View
                          style={[styles.topBar, { width: `${Math.round((p.qty / max) * 100)}%` }]}
                        />
                      </View>
                      <AppText variant="caption" color="mutedBright" style={styles.topQty}>
                        {p.qty}kg
                      </AppText>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState title="No data yet" hint="Sales data will appear once orders arrive." />
            )}
          </Card>

          {/* Recent orders */}
          <Card>
            <View style={styles.chartHead}>
              <AppText variant="title">Recent Orders</AppText>
              <Pressable onPress={() => navigation.navigate('Orders')} hitSlop={8}>
                <AppText variant="label" color="aqua">
                  View All
                </AppText>
              </Pressable>
            </View>
            {orders.isLoading ? (
              <LoadingState label="Loading orders…" />
            ) : recentOrders.length ? (
              <View style={styles.orderList}>
                {recentOrders.map((order) => (
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

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  content: { gap: spacing.lg },
  welcome: { gap: spacing.xs },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  toggleBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  toggleBtnActive: { backgroundColor: colors.aqua },
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
  topList: { marginTop: spacing.lg, gap: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  topRank: { width: 22, textAlign: 'center' },
  topName: { flex: 1 },
  topBarWrap: {
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlive,
    overflow: 'hidden',
  },
  topBar: { height: '100%', backgroundColor: colors.aqua },
  topQty: { width: 48, textAlign: 'right' },
  orderList: { gap: spacing.md, marginTop: spacing.lg },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  orderMeta: { gap: 2, flex: 1 },
  orderRight: { alignItems: 'flex-end', gap: spacing.xs },
});
