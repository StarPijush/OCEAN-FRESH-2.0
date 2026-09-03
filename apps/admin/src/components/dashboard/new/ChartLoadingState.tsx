import { Skeleton } from '../../../components/ui/new/Skeleton';
import { useBreakpoint } from '../../../hooks/use-breakpoint';

export function ChartLoadingState() {
  const { width } = useBreakpoint();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const chartHeight = isMobile ? 200 : isTablet ? 220 : 240;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton
        variant="text"
        width="40%"
        height={20}
        style={{ borderRadius: 'var(--radius-sm)' }}
      />
      <Skeleton
        variant="text"
        width="30%"
        height={12}
        style={{ borderRadius: 'var(--radius-sm)' }}
      />
      <div style={{ height: 8 }} />
      <Skeleton variant="rectangular" height={32} style={{ borderRadius: '999px' }} />
      <div style={{ height: 16 }} />
      <Skeleton
        variant="rectangular"
        height={chartHeight}
        style={{ borderRadius: 'var(--radius-card)' }}
      />
    </div>
  );
}
