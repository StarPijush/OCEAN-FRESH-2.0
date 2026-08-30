import type { Order } from '@oceanfresh/shared';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import {
  PerformanceChart,
  RecentOrdersList,
  StatGrid,
  TopProductsList,
} from '../components/dashboard';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { StatTile } from '../components/StatCard';
import { ErrorState } from '../components/StateViews';
import { useAdminSession } from '../hooks/use-auth-session';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { useOrders } from '../hooks/use-orders';
import { useAdminProfile } from '../hooks/use-settings';
import { colors, radius, spacing, STAT_GUTTER, statTileWidth } from '../theme';
import { errorToMessage } from '../utils/error';

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

  const tileWidth = statTileWidth(width);

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
                disabled={refreshing}
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

        {/* Stat cards — independent loading/error/empty per prompt §6 & §8 */}
        {isLoading ? (
          <div style={tilesStyle}>
            {Array.from({ length: 4 }).map((_, i) => (
              <StatTile key={i} width={tileWidth}>
                <Skeleton height={104} radiusValue={radius.lg} />
              </StatTile>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={errorToMessage(error)} onRetry={refetch} />
        ) : !stats ? (
          <ErrorState message="No dashboard data" onRetry={refetch} />
        ) : (
          <StatGrid stats={stats} />
        )}

        {/* 7-day chart — skeleton only for this section, not full page */}
        {isLoading ? (
          <Skeleton height={240} radiusValue={radius.lg} />
        ) : isError || !stats ? null : (
          <PerformanceChart chart={stats.chart} mode={chartMode} onModeChange={setChartMode} />
        )}

        {/* Top products — skeleton only for this section */}
        {isLoading ? (
          <Skeleton height={180} radiusValue={radius.lg} />
        ) : isError || !stats ? null : (
          <TopProductsList topProducts={stats.topProducts} />
        )}

        {/* Recent orders — own query, own loading state, never blocks shell */}
        <RecentOrdersList
          orders={(orders.data?.items as Order[]) ?? []}
          isLoading={orders.isLoading}
          onViewAll={() => navigate('/orders')}
        />
      </div>
    </div>
  );
}
