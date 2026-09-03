import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ChartDataPoint, ChartMetric } from '../../../services/dashboard-stats';
import { formatCurrency } from '../../../utils/format';

interface Props {
  data: ChartDataPoint[];
  metric: ChartMetric;
  maxValue: number;
  height: number;
  isMobile: boolean;
  onBarClick?: (point: ChartDataPoint) => void;
}

interface TooltipData {
  point: ChartDataPoint;
  rect: DOMRect | null;
  visible: boolean;
}

export function ChartBars({ data, metric, maxValue, height, isMobile, onBarClick }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData>({
    point: data[0],
    rect: null,
    visible: false,
  });
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Responsive slot: AVAILABLE_PLOT / 7 → bar + gap within slot (§11)
  const barMaxHeight = height - 24;
  // Plot uses flex1 grid slots — barWidth derived from slot, not fixed desktop assumption
  const barWidth = isMobile ? 14 : 18;
  const barGap = isMobile ? 8 : 10;

  const handleBarEnter = (point: ChartDataPoint, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ point, rect, visible: true });
  };

  const handleBarLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleBarClick = (point: ChartDataPoint, e?: React.MouseEvent | React.TouchEvent) => {
    onBarClick?.(point);
    setSelectedDate(point.date);
    const target = (e?.currentTarget as HTMLElement) ?? null;
    const rect = target?.getBoundingClientRect() ?? chartRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({ point, rect, visible: true });
    }
  };

  const handleTouchStart = (point: ChartDataPoint, e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSelectedDate(point.date);
    const touch = e.touches[0];
    const rect = {
      left: touch.clientX,
      top: touch.clientY,
      right: touch.clientX,
      bottom: touch.clientY,
      width: 0,
      height: 0,
      x: touch.clientX,
      y: touch.clientY,
    } as DOMRect;
    setTooltip({ point, rect, visible: true });
  };

  useEffect(() => {
    if (!tooltip.visible) return;
    const handleOutside = (ev: MouseEvent | TouchEvent) => {
      const target = ev.target as Node;
      if (chartRef.current && !chartRef.current.contains(target)) {
        setTooltip((p) => ({ ...p, visible: false }));
      }
    };
    const handleScroll = () => setTooltip((p) => ({ ...p, visible: false }));
    const handleKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setTooltip((p) => ({ ...p, visible: false }));
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [tooltip.visible]);

  // ChartViewport → Axis remembers baseline is bottom-0; plot uses flex1 slots
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Plot: 7 slots — grid ensures even distribution across AVAILABLE_PLOT (§11) */}
      <div
        ref={chartRef}
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          gap: barGap,
          alignItems: 'end',
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {data.map((point) => {
          const value = metric === 'income' ? point.income : point.sales;
          const pct = maxValue > 0 ? value / maxValue : 0;
          // Zero baseline §12: 4px subtle pedestal at baseline, bars rise from baseline
          const barHeight = value === 0 ? 4 : Math.max(8, pct * barMaxHeight);
          const isCurrent = point.isCurrent;
          const isSelected = selectedDate === point.date;

          return (
            <div
              key={point.date}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 6,
                minWidth: 0,
                maxWidth: '100%',
                position: 'relative',
                zIndex: 2,
                height: '100%',
              }}
              onMouseEnter={(e) => handleBarEnter(point, e)}
              onMouseLeave={handleBarLeave}
              onClick={(e) => handleBarClick(point, e)}
              onTouchStart={(e) => handleTouchStart(point, e)}
              role="img"
              aria-label={`${point.label}: ${metric === 'income' ? formatCurrency(value) : value} ${metric}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBarClick(point);
                }
              }}
            >
              <div
                style={{
                  flex: 1,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  minHeight: 0,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: barWidth,
                    maxWidth: '68%',
                    minWidth: isMobile ? 10 : 12,
                    height: barHeight,
                    borderRadius: value === 0 ? 2 : '6px 6px 0 0',
                    background:
                      value === 0
                        ? '#E9EFEF'
                        : isSelected
                          ? '#0d2035'
                          : isCurrent
                            ? '#4ab8c1'
                            : metric === 'income'
                              ? '#0B130F'
                              : 'rgba(74,184,193,0.65)',
                    opacity:
                      value > 0
                        ? isSelected
                          ? 1
                          : isCurrent
                            ? 1
                            : metric === 'sales'
                              ? 0.9
                              : 1
                        : 1,
                    transition:
                      'height 300ms var(--ease-out), background 200ms ease, transform 150ms ease, box-shadow 200ms ease',
                    transformOrigin: 'bottom center',
                    boxShadow:
                      (isSelected || isCurrent) && value > 0
                        ? '0 2px 8px rgba(13,32,53,0.12)'
                        : 'none',
                    outline: isSelected ? '1px solid #0d2035' : 'none',
                    flexShrink: 0,
                  }}
                />
              </div>
              {isCurrent && value > 0 && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#4ab8c1',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#0B130F' : '#6C7E75',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  minHeight: 11,
                  lineHeight: 1,
                  textAlign: 'center',
                }}
              >
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
      {selectedDate !== null &&
        (() => {
          const sel = data.find((d) => d.date === selectedDate);
          if (!sel) return null;
          const val = metric === 'income' ? sel.income : sel.sales;
          const dateStr = new Date(sel.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                background: '#F8FAF9',
                border: '1px solid rgba(11,19,15,0.06)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: '#6C7E75',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {dateStr}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0B130F',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {metric === 'income' ? formatCurrency(val) : `${val} sales`}
              </span>
            </div>
          );
        })()}
      {tooltip.visible && tooltip.point && tooltip.rect && (
        <ChartTooltipPortal
          point={tooltip.point}
          metric={metric}
          rect={tooltip.rect}
          chartRect={chartRef.current?.getBoundingClientRect() ?? null}
        />
      )}
    </div>
  );
}

interface ChartTooltipPortalProps {
  point: ChartDataPoint;
  metric: ChartMetric;
  rect: DOMRect;
  chartRect: DOMRect | null;
}

function ChartTooltipPortal({
  point,
  metric,
  rect,
  chartRect: _chartRect,
}: ChartTooltipPortalProps) {
  const value = metric === 'income' ? point.income : point.sales;
  const portal = document.getElementById('tooltip-portal') || document.body;

  const formatValue = (val: number) => (metric === 'income' ? formatCurrency(val) : String(val));

  const formatDateLabel = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const tooltipWidth = 160;
  const tooltipHeight = 72;
  const gap = 8;

  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  let top = rect.top - tooltipHeight - gap;

  // Clamp to viewport
  if (left < 8) left = 8;
  if (left + tooltipWidth > window.innerWidth - 8) left = window.innerWidth - tooltipWidth - 8;
  if (top < 8) {
    top = rect.bottom + gap;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: 'var(--z-tooltip)',
    pointerEvents: 'none',
  };

  const contentStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid rgba(11,19,15,0.08)',
    borderRadius: 14,
    padding: '10px 14px',
    boxShadow: '0 20px 50px rgba(11,19,15,0.12)',
    minWidth: '140px',
    maxWidth: '200px',
    animation: 'fadeIn var(--duration-fast) var(--ease-out)',
  };

  return createPortal(
    <div style={style}>
      <div style={contentStyle}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 11,
            color: '#6C7E75',
            marginBottom: 2,
          }}
        >
          {formatDateLabel(point.date)}
        </div>
        <div
          style={{
            fontSize: 10,
            color: '#4ab8c1',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 4,
          }}
        >
          {metric === 'income' ? 'Income' : 'Sales'}
        </div>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            color: '#0B130F',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
        >
          {formatValue(value)}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          width: '12px',
          height: '12px',
          background: '#FFFFFF',
          borderLeft: '1px solid rgba(11,19,15,0.08)',
          borderBottom: '1px solid rgba(11,19,15,0.08)',
        }}
        aria-hidden="true"
      />
    </div>,
    portal,
  );
}
