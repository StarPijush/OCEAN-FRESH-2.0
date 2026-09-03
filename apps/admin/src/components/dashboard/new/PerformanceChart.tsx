import { useCallback } from 'react';

import type { AnalyticsChartData, ChartRange } from '../../../services/dashboard-stats';
import { ChartCanvas } from './ChartCanvas';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartErrorState } from './ChartErrorState';
import { ChartLoadingState } from './ChartLoadingState';
import { PerformanceChartHeader } from './PerformanceChartHeader';

interface Props {
  chartData: AnalyticsChartData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRefresh: () => void;
  onMetricChange: (metric: 'income' | 'sales') => void;
  onRangeChange: (range: ChartRange) => void;
}

export function PerformanceChart({
  chartData,
  isLoading,
  isError,
  error,
  onRefresh,
  onMetricChange,
  onRangeChange,
}: Props) {
  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const compactStyle = {
    background: '#FFFFFF',
    border: '1px solid rgba(11,19,15,0.06)',
    borderRadius: 24,
    padding: 'clamp(18px, 4vw, 1.75rem)',
    boxShadow: '0 10px 30px rgba(11,19,15,0.04)',
    minWidth: 0 as const,
    overflow: 'hidden' as const,
  } as const;

  if (isLoading) {
    return (
      <div style={compactStyle}>
        <ChartLoadingState />
      </div>
    );
  }

  if (isError || !chartData) {
    return (
      <div style={compactStyle}>
        <ChartErrorState
          message={error?.message ?? 'Failed to load performance data'}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  if (chartData.data.length === 0 || chartData.maxValue === 0) {
    return (
      <div style={{ ...compactStyle, overflow: 'hidden', minWidth: 0 }}>
        <PerformanceChartHeader
          title="Revenue Trends"
          subtitle="Last 7 days"
          metric={chartData.metric}
          onMetricChange={onMetricChange}
          range={chartData.range}
          onRangeChange={onRangeChange}
        />
        <ChartEmptyState range="week" />
      </div>
    );
  }

  return (
    <div style={{ ...compactStyle, overflow: 'hidden', minWidth: 0 }}>
      <PerformanceChartHeader
        title="Revenue Trends"
        subtitle="Last 7 days · tap a bar for details"
        metric={chartData.metric}
        onMetricChange={onMetricChange}
        range={chartData.range}
        onRangeChange={onRangeChange}
      />
      <ChartCanvas chartData={chartData} />
    </div>
  );
}
