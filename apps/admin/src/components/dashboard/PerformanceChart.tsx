import { useEffect, useRef, useState } from 'react';

import { colors, radius, spacing } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { AppText } from '../AppText';
import { Card } from '../Card';

interface ChartDay {
  label: string;
  sales: number;
  income: number;
}

interface PerformanceChartProps {
  chart: ChartDay[];
  mode: 'income' | 'sales';
  onModeChange: (mode: 'income' | 'sales') => void;
}

export function PerformanceChart({ chart, mode, onModeChange }: PerformanceChartProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const maxDay = Math.max(...chart.map((d) => (mode === 'income' ? d.income : d.sales)), 1);

  const handleBarMouseEnter = (dayLabel: string) => setHoveredDay(dayLabel);
  const handleBarMouseLeave = () => setHoveredDay(null);

  const handleTouchStart = (dayLabel: string) => {
    setHoveredDay(dayLabel);
    // Auto-hide tooltip after 2 seconds on touch
    setTimeout(() => setHoveredDay(null), 2000);
  };

  // Position tooltip relative to container
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (hoveredDay && chartContainerRef.current) {
      const container = chartContainerRef.current;
      const rect = container.getBoundingClientRect();
      // Find the bar element
      const bar = container.querySelector(`[data-day="${hoveredDay}"]`);
      if (bar) {
        const barRect = bar.getBoundingClientRect();
        setTooltipPosition({
          x: barRect.left - rect.left + barRect.width / 2,
          y: barRect.top - rect.top,
        });
      }
    }
  }, [hoveredDay]);

  const dayData = chart.find((d) => d.label === hoveredDay);
  const hoveredValue = dayData ? (mode === 'income' ? dayData.income : dayData.sales) : 0;

  return (
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
          {(['income', 'sales'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
              className="of-btn"
              style={{
                paddingLeft: spacing.md,
                paddingRight: spacing.md,
                paddingTop: spacing.sm + 2,
                paddingBottom: spacing.sm + 2,
                backgroundColor: mode === m ? colors.aqua : 'transparent',
              }}
            >
              <AppText variant="label" color={mode === m ? 'bg' : 'mutedBright'}>
                {m === 'income' ? 'Income' : 'Sales'}
              </AppText>
            </button>
          ))}
        </div>
      </div>
      <div
        ref={chartContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: spacing.sm,
          marginTop: spacing.lg,
          height: 140,
          position: 'relative',
        }}
      >
        {chart.map((day) => {
          const value = mode === 'income' ? day.income : day.sales;
          const pct = maxDay > 0 ? (value / maxDay) * 96 : 0;
          const isHovered = hoveredDay === day.label;

          return (
            <div
              key={day.label}
              data-day={day.label}
              onMouseEnter={() => handleBarMouseEnter(day.label)}
              onMouseLeave={handleBarMouseLeave}
              onTouchStart={() => handleTouchStart(day.label)}
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
                  ? mode === 'income'
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
                    transition: 'height 0.3s ease, background-color 0.2s ease',
                    transformOrigin: 'bottom center',
                    transform: isHovered ? 'scaleY(1.02)' : 'none',
                  }}
                />
              </div>
              <AppText variant="caption" color="muted" style={{ marginTop: 2 }}>
                {day.label}
              </AppText>
            </div>
          );
        })}

        {/* Tooltip */}
        {hoveredDay && dayData && (
          <div
            style={{
              position: 'absolute',
              bottom: '150%',
              left: tooltipPosition.x,
              transform: 'translateX(-50%) translateY(-8px)',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: radius.md,
              padding: `${spacing.sm}px ${spacing.md}px`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 10,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'of-fade 150ms ease',
            }}
          >
            <AppText variant="label" color="cream">
              {mode === 'income' ? formatCurrency(hoveredValue) : String(hoveredValue)}
            </AppText>
            <AppText variant="caption" color="muted">
              {hoveredDay}
            </AppText>
            <div
              style={{
                width: 6,
                height: 6,
                backgroundColor: colors.surface,
                borderLeft: `1px solid ${colors.borderStrong}`,
                borderBottom: `1px solid ${colors.borderStrong}`,
                transform: 'rotate(45deg)',
                position: 'absolute',
                bottom: -3,
                left: '50%',
                marginLeft: -3,
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
