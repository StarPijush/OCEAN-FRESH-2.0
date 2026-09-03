import type { ChartRange } from '../../../services/dashboard-stats';

interface Props {
  title: string;
  subtitle: string;
  metric: 'income' | 'sales';
  onMetricChange: (metric: 'income' | 'sales') => void;
  range: ChartRange;
  onRangeChange: (_range: ChartRange) => void;
}

export function PerformanceChartHeader({ title, subtitle, metric, onMetricChange }: Props) {
  const subtitleText = 'Last 7 days · tap a bar for details';
  // Use provided subtitle only for accessibility, but display forced 7-day copy per §14
  void subtitle;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: '1px solid rgba(11,19,15,0.06)',
        minWidth: 0,
      }}
    >
      {/* Left: flexible width — title + context */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '1 1 160px' }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0B130F',
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: '#6C7E75',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: metric === 'income' ? '#0d2035' : '#4ab8c1',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {metric === 'income' ? 'Income' : 'Sales'}
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12,
            color: '#6C7E75',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitleText}
        </span>
      </div>
      {/* Right: intrinsic width — metric selector top-right */}
      <div
        role="group"
        aria-label="Chart metric"
        style={{
          display: 'flex',
          borderRadius: 999,
          border: '1px solid rgba(11,19,15,0.06)',
          background: '#F8FAF9',
          padding: 3,
          height: 32,
          alignItems: 'center',
          flexShrink: 0,
          alignSelf: 'center',
        }}
      >
        {(['income', 'sales'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMetricChange(m)}
            aria-pressed={metric === m}
            style={{
              padding: '0 12px',
              height: 24,
              borderRadius: 999,
              border: 'none',
              background: metric === m ? '#0d2035' : 'transparent',
              color: metric === m ? '#FFFFFF' : '#6C7E75',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 52,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 150ms var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            {m === 'income' ? 'Income' : 'Sales'}
          </button>
        ))}
      </div>
    </div>
  );
}
