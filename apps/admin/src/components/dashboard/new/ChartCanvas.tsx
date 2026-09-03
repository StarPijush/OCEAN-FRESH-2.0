import { useBreakpoint } from '../../../hooks/use-breakpoint';
import type { AnalyticsChartData, ChartDataPoint } from '../../../services/dashboard-stats';
import { ChartAxis } from './ChartAxis';
import { ChartBars } from './ChartBars';

interface Props {
  chartData: AnalyticsChartData;
  onBarClick?: (point: ChartDataPoint) => void;
}

export function ChartCanvas({ chartData, onBarClick }: Props) {
  const { width } = useBreakpoint();
  const isMobile = width < 640;
  const isSmall = width < 375;
  const isTablet = width >= 640 && width < 1024;
  // Spark token heights: 200/220/240 — premium breath, not cramped
  const chartHeight = isMobile ? 200 : isTablet ? 220 : 240;
  // Precision fit: reclaim plot width on small screens (§9 — available width calc)
  const yAxisWidth = isSmall ? 44 : isMobile ? 48 : 56;

  return (
    <ChartAxis
      ticks={chartData.yAxisTicks}
      height={chartHeight}
      yAxisWidth={yAxisWidth}
      paddingBottom={24}
    >
      <ChartBars
        data={chartData.data}
        metric={chartData.metric}
        maxValue={chartData.maxValue}
        height={chartHeight}
        isMobile={isMobile}
        onBarClick={onBarClick}
      />
    </ChartAxis>
  );
}
