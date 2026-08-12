import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { StatCard, StatTile } from '../components/StatCard';
import { EmptyState, ErrorState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { useAdminSession } from '../hooks/use-auth-session';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { useOrders } from '../hooks/use-orders';
import { useAdminProfile } from '../hooks/use-settings';
import { colors, radius, spacing, STAT_GUTTER, statTileWidth } from '../theme';
import { errorToMessage } from '../utils/error';
import { formatCurrency, formatTime } from '../utils/format';

type ChartMode = 'income' | 'sales';

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const session = useAdminSession();
  const { width } = useBreakpoint();
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

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Admin';

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  };

  const tilesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -STAT_GUTTER,
    marginRight: -STAT_GUTTER,
  };

  if (isError || (!isLoading && !stats)) {
    return (
      <div style={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <div style={contentStyle}>
          <PageHeader
            title="Dashboard"
            subtitle={`Hello, ${firstName}. Here's what's happening in your shop today.`}
          />
          <ErrorState message={errorToMessage(error)} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (isLoading || !stats) {
    const tileWidth = statTileWidth(width);
    return (
      <div style={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <div style={contentStyle}>
          <PageHeader
            title="Dashboard"
            subtitle={`Hello, ${firstName}. Here's what's happening in your shop today.`}
          />
          <div style={tilesStyle}>
            {Array.from({ length: 4 }).map((_, i) => (
              <StatTile key={i} width={tileWidth}>
                <Skeleton height={104} radiusValue={radius.lg} />
              </StatTile>
            ))}
          </div>
          <Skeleton height={240} radiusValue={radius.lg} />
          <Skeleton height={180} radiusValue={radius.lg} />
        </div>
      </div>
    );
  }

  const maxDay = Math.max(
    ...stats.chart.map((d) => (chartMode === 'income' ? d.income : d.sales)),
    1,
  );

  const recentOrders = orders.isLoading ? [] : (orders.data?.items ?? []).slice(0, 5);

  return (
    <div style={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
      <div style={contentStyle}>
        <PageHeader
          title="Dashboard"
          subtitle={`Hello, ${firstName} — today's performance and trends.`}
          actions={
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <button
                type="button"
                className="of-btn"
                onClick={() => void onRefresh()}
                aria-label="Refresh dashboard"
                title="Refresh"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: radius.full,
                  border: `1px solid ${colors.borderStrong}`,
                  backgroundColor: colors.surface,
                }}
              >
                <Icon
                  name="refresh-outline"
                  size={16}
                  color={colors.mutedBright}
                  className={refreshing ? 'of-spin' : undefined}
                />
              </button>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.borderStrong}`,
                  borderRadius: radius.full,
                  paddingLeft: spacing.md,
                  paddingRight: spacing.md,
                  paddingTop: spacing.sm,
                  paddingBottom: spacing.sm,
                }}
              >
                <Icon name="calendar-outline" size={14} color={colors.mutedBright} />
                <AppText variant="caption" color="mutedBright">
                  {todayLabel()}
                </AppText>
              </div>
            </div>
          }
        />

        {/* Stat cards */}
        <div style={tilesStyle}>
          <StatCard
            label="Today's Sales"
            value={String(stats.todaySales)}
            tone="aqua"
            icon="cart-outline"
          />
          <StatCard
            label="Today's Income"
            value={formatCurrency(stats.todayIncome)}
            tone="green"
            icon="cash-outline"
          />
          <StatCard
            label="This Week"
            value={formatCurrency(stats.weekIncome)}
            tone="gold"
            icon="trending-up-outline"
          />
          <StatCard
            label="Pending Orders"
            value={String(stats.pendingOrders)}
            tone="warn"
            icon="time-outline"
          />
          <StatCard
            label="Total Orders"
            value={String(stats.totalOrders)}
            tone="muted"
            icon="receipt-outline"
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalIncome)}
            tone="green"
            icon="wallet-outline"
          />
          <StatCard
            label="Products Active"
            value={`${stats.availableProducts} / ${stats.totalProducts}`}
            tone="aqua"
            icon="fish-outline"
          />
        </div>

        {/* 7-day chart */}
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <AppText variant="title">7-Day Performance</AppText>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                borderRadius: radius.md,
                overflow: 'hidden',
                border: `1px solid ${colors.borderStrong}`,
              }}
            >
              {(['income', 'sales'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  aria-pressed={chartMode === mode}
                  className="of-btn"
                  style={{
                    paddingLeft: spacing.md,
                    paddingRight: spacing.md,
                    paddingTop: spacing.sm + 2,
                    paddingBottom: spacing.sm + 2,
                    backgroundColor: chartMode === mode ? colors.aqua : 'transparent',
                  }}
                >
                  <AppText variant="label" color={chartMode === mode ? 'bg' : 'mutedBright'}>
                    {mode === 'income' ? 'Income' : 'Sales'}
                  </AppText>
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: spacing.sm,
              marginTop: spacing.lg,
              height: 140,
            }}
          >
            {stats.chart.map((day) => {
              const value = chartMode === 'income' ? day.income : day.sales;
              const pct = maxDay > 0 ? (value / maxDay) * 96 : 0;
              return (
                <div
                  key={day.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: spacing.xs,
                    minWidth: 0,
                  }}
                >
                  <AppText
                    variant="caption"
                    color="muted"
                    numberOfLines={1}
                    style={{ height: 16, maxWidth: '100%' }}
                  >
                    {value > 0
                      ? chartMode === 'income'
                        ? `₹${Math.round(value / 1000)}k`
                        : String(value)
                      : ''}
                  </AppText>
                  <div
                    style={{
                      flex: 1,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '70%',
                        height: Math.max(4, pct),
                        borderTopLeftRadius: radius.sm,
                        borderTopRightRadius: radius.sm,
                        backgroundColor: value > 0 ? colors.aqua : colors.borderStrong,
                      }}
                    />
                  </div>
                  <AppText variant="caption" color="muted" style={{ marginTop: 2 }}>
                    {day.label}
                  </AppText>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top products */}
        <Card>
          <AppText variant="title">Top Products · This Month</AppText>
          {stats.topProducts.length ? (
            <div
              style={{
                marginTop: spacing.lg,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md,
              }}
            >
              {stats.topProducts.map((p, i) => {
                const max = stats.topProducts[0]?.qty ?? 1;
                return (
                  <div
                    key={p.name}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: colors.aquaDim,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppText variant="label" color="aqua">
                        {i + 1}
                      </AppText>
                    </div>
                    <AppText variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                      {p.name}
                    </AppText>
                    <div
                      style={{
                        width: 72,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.surfaceAlive,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: colors.aqua,
                          width: `${Math.round((p.qty / max) * 100)}%`,
                        }}
                      />
                    </div>
                    <AppText
                      variant="caption"
                      color="mutedBright"
                      style={{ width: 48, textAlign: 'right' }}
                    >
                      {p.qty} kg
                    </AppText>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No data yet" hint="Sales data will appear once orders arrive." />
          )}
        </Card>

        {/* Recent orders */}
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <AppText variant="title">Recent Orders</AppText>
            <button type="button" className="of-btn" onClick={() => navigate('/orders')}>
              <AppText variant="label" color="aqua">
                View All
              </AppText>
            </button>
          </div>
          {orders.isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md,
                marginTop: spacing.lg,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          ) : recentOrders.length ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md,
                marginTop: spacing.lg,
              }}
            >
              {recentOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="of-btn"
                  onClick={() => navigate('/orders')}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.sm,
                    borderBottom: `1px solid ${colors.border}`,
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    <AppText variant="bodyMedium">{order.orderNumber}</AppText>
                    <AppText variant="caption" color="muted">
                      {formatTime(new Date(order.createdAt).getTime())} ·{' '}
                      {order.customerSnapshot?.name ?? 'Guest'}
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
                    <AppText variant="bodyMedium">
                      {formatCurrency(order.totals?.grandTotal?.amount ?? 0)}
                    </AppText>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders yet" hint="New orders will appear here." />
          )}
        </Card>
      </div>
    </div>
  );
}
