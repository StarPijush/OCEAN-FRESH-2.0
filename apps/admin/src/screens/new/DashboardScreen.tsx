import type { Order } from '@oceanfresh/shared';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardHeader } from '../../components/dashboard/new/DashboardHeader';
import { MetricGrid } from '../../components/dashboard/new/MetricGrid';
import { PerformanceChart } from '../../components/dashboard/new/PerformanceChart';
import { RecentOrdersList } from '../../components/dashboard/new/RecentOrdersList';
import { TopProductsList } from '../../components/dashboard/new/TopProductsList';
import { ErrorState } from '../../components/ui/new/ErrorState';
import { Skeleton } from '../../components/ui/new/Skeleton';
import { useAdminSession } from '../../hooks/use-auth-session';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';
import { useOrders } from '../../hooks/use-orders';
import { useAdminProfile } from '../../hooks/use-settings';
import type { ChartRange } from '../../services/dashboard-stats';
import { errorToMessage } from '../../utils/error';

type ChartMode = 'income' | 'sales';

export function DashboardScreen() {
  const navigate = useNavigate();
  const session = useAdminSession();
  const { width } = useBreakpoint();
  const [chartMode, setChartMode] = useState<ChartMode>('income');
  const chartRange: ChartRange = 'week';
  const {
    data: stats,
    chartData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardStats(chartRange, chartMode);
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

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Admin';
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const containerPadding = isMobile ? 16 : isTablet ? 20 : 24;
  const sectionGap = isMobile ? 16 : isTablet ? 20 : 24;

  return (
    <div
      style={{
        background: '#F4F6F5',
        minHeight: '100%',
        padding: `${sectionGap}px ${containerPadding}px`,
        paddingBottom: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: sectionGap,
          maxWidth: isDesktop ? 1280 : '100%',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <DashboardHeader
            title="Dashboard"
            subtitle={`Hello, ${firstName} — here's what's happening today.`}
            onRefresh={() => void onRefresh()}
            refreshing={refreshing}
          />
        </div>

        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: 400,
              width: '100%',
            }}
          >
            <Skeleton
              variant="rectangular"
              height={isMobile ? 118 : 132}
              style={{ borderRadius: 24, width: '100%' }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: width < 375 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={isMobile ? 108 : 114}
                  style={{ borderRadius: 18, width: '100%' }}
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <ErrorState message={errorToMessage(error)} onRetry={() => void refetch()} />
        ) : !stats ? (
          <ErrorState message="No dashboard data" onRetry={() => void refetch()} />
        ) : (
          <MetricGrid stats={stats} width={width} />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1.6fr 1fr' : '1fr',
            gap: 12,
            alignItems: 'start',
          }}
        >
          <PerformanceChart
            chartData={chartData}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRefresh={onRefresh}
            onMetricChange={setChartMode}
            onRangeChange={() => {}}
          />
          <RecentOrdersList
            orders={(orders.data?.items as Order[]) ?? []}
            isLoading={orders.isLoading || isLoading}
            onViewAll={() => navigate('/orders')}
          />
        </div>

        {isLoading ? (
          <Skeleton
            variant="rectangular"
            height={isMobile ? 180 : 200}
            style={{ borderRadius: 24 }}
          />
        ) : isError || !stats ? null : (
          <TopProductsList topProducts={stats.topProducts} />
        )}
      </div>
    </div>
  );
}
