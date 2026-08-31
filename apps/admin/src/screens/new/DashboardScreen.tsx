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
import { errorToMessage } from '../../utils/error';

type ChartMode = 'income' | 'sales';

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
  const isMobile = width < 768;

  const containerPadding = isMobile ? 16 : 24;
  const sectionGap = isMobile ? 16 : 20;

  return (
    <div
      style={{
        background: 'var(--color-bg)',
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
          maxWidth: 1120,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <DashboardHeader
          title="Dashboard"
          subtitle={`Hello, ${firstName} — here's what's happening today.`}
          onRefresh={() => void onRefresh()}
          refreshing={refreshing}
        />

        {isLoading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                width < 480 ? '1fr' : width < 768 ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
              gap: isMobile ? 12 : 16,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={isMobile ? 110 : 118}
                style={{ borderRadius: 16 }}
              />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={errorToMessage(error)} onRetry={() => void refetch()} />
        ) : !stats ? (
          <ErrorState message="No dashboard data" onRetry={() => void refetch()} />
        ) : (
          <MetricGrid stats={stats} />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: width >= 1024 ? '1.55fr 1fr' : '1fr',
            gap: isMobile ? 16 : 20,
            alignItems: 'start',
          }}
        >
          {isLoading ? (
            <Skeleton
              variant="rectangular"
              height={isMobile ? 220 : 260}
              style={{ borderRadius: 16 }}
            />
          ) : isError || !stats ? null : (
            <PerformanceChart chart={stats.chart} mode={chartMode} onModeChange={setChartMode} />
          )}
          <RecentOrdersList
            orders={(orders.data?.items as Order[]) ?? []}
            isLoading={orders.isLoading || isLoading}
            onViewAll={() => navigate('/orders')}
          />
        </div>

        {isLoading ? (
          <Skeleton variant="rectangular" height={180} style={{ borderRadius: 16 }} />
        ) : isError || !stats ? null : (
          <TopProductsList topProducts={stats.topProducts} />
        )}
      </div>
    </div>
  );
}
