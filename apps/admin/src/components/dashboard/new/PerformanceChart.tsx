import { useRef, useState } from 'react';

import { formatCurrency } from '../../../utils/format';

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
  const ref = useRef<HTMLDivElement>(null);
  const maxDay = Math.max(...chart.map((d) => (mode === 'income' ? d.income : d.sales)), 1);
  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 240;
  const dayData = chart.find((d) => d.label === hoveredDay);
  const hoveredValue = dayData ? (mode === 'income' ? dayData.income : dayData.sales) : 0;

  // rough today detection (weekday short)
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
  } as Intl.DateTimeFormatOptions);

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 400,
              color: 'var(--color-cream)',
              letterSpacing: '-0.02em',
            }}
          >
            7-Day Performance
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
            Revenue and order trends
          </span>
        </div>
        <div
          role="group"
          aria-label="Chart mode"
          style={{
            display: 'flex',
            borderRadius: 999,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface2)',
            padding: 3,
            height: 36,
            alignItems: 'center',
          }}
        >
          {(['income', 'sales'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
              style={{
                padding: '0 14px',
                height: 28,
                borderRadius: 999,
                border: 'none',
                background: mode === m ? 'var(--color-aqua)' : 'transparent',
                color: mode === m ? 'var(--color-bg)' : 'var(--color-muted2)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: 64,
              }}
            >
              {m === 'income' ? 'Income' : 'Sales'}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          marginTop: 20,
          height: chartHeight,
          position: 'relative',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 0,
        }}
      >
        {chart.map((day) => {
          const value = mode === 'income' ? day.income : day.sales;
          const pct = maxDay > 0 ? (value / maxDay) * 96 : 0;
          const isHovered = hoveredDay === day.label;
          const isToday = day.label === todayLabel;
          return (
            <div
              key={day.label}
              onMouseEnter={() => setHoveredDay(day.label)}
              onMouseLeave={() => setHoveredDay(null)}
              onTouchStart={() => {
                setHoveredDay(day.label);
                setTimeout(() => setHoveredDay(null), 2000);
              }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  height: 14,
                  fontSize: 10,
                  fontWeight: value > 0 ? 600 : 400,
                  color: 'var(--color-muted2)',
                  fontVariantNumeric: 'tabular-nums' as const,
                }}
              >
                {value > 0
                  ? mode === 'income'
                    ? `₹${Math.round(value / 1000)}k`
                    : String(value)
                  : ''}
              </span>
              <div
                style={{
                  flex: 1,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 28,
                    maxWidth: '64%',
                    height: Math.max(6, (pct / 96) * (chartHeight - 32)),
                    borderRadius: 6,
                    background: isToday
                      ? 'var(--color-aqua)'
                      : value > 0
                        ? 'rgba(74,184,193,0.5)'
                        : 'rgba(255,255,255,0.08)',
                    transition:
                      'height 300ms var(--ease-out), background 200ms ease, transform 150ms ease',
                    transformOrigin: 'bottom center',
                    transform: isHovered ? 'scaleY(1.04)' : 'none',
                    boxShadow: isToday ? '0 4px 12px rgba(74,184,193,0.25)' : 'none',
                  }}
                />
              </div>
              <span
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--color-aqua)' : 'var(--color-muted2)',
                }}
              >
                {day.label}
              </span>
            </div>
          );
        })}
        {hoveredDay && dayData && (
          <div
            style={{
              position: 'absolute',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--color-surface2)',
              border: '1px solid var(--color-border2)',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 10,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-cream)', fontWeight: 600 }}>
              {mode === 'income' ? formatCurrency(hoveredValue) : String(hoveredValue)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{hoveredDay}</div>
          </div>
        )}
      </div>
    </div>
  );
}
