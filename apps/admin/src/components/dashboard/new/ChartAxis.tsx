import type { ReactNode } from 'react';

interface Props {
  ticks: { value: number; label: string }[];
  height: number;
  yAxisWidth?: number;
  children: ReactNode;
  paddingBottom?: number;
}

export function ChartAxis({ ticks, height, yAxisWidth = 56, children, paddingBottom = 24 }: Props) {
  // Plot width = CARD CONTENT - Y_WIDTH - GAP (8/12) — flex:1 min0 ensures adaptation (§6)
  // Origin is bottom-left of plot: Y right edge + baseline at bottom padding (§5)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height,
        position: 'relative',
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Y-axis: fixed intrinsic width 40-56 responsive, right-aligned tabular */}
      <div
        style={{
          width: yAxisWidth,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          paddingBottom,
          paddingRight: yAxisWidth <= 48 ? 8 : 12,
          boxSizing: 'border-box',
        }}
        aria-hidden="true"
      >
        {ticks.map((tick, i) => (
          <span
            key={i}
            style={{
              height: 20,
              fontSize: 11,
              fontWeight: 500,
              color: '#6C7E75',
              fontVariantNumeric: 'tabular-nums' as const,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tick.label}
          </span>
        ))}
      </div>
      {/* Plot: remaining available width — flex1 min0 (§9) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          maxWidth: '100%',
          height: '100%',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Plot area (above X-axis): grid + bars */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {/* Horizontal grid — aligned to Y ticks, bottom is baseline (§12) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              pointerEvents: 'none',
              zIndex: 1,
              paddingBottom: 0,
            }}
            aria-hidden="true"
          >
            {ticks.slice(0, -1).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 1,
                  background: `linear-gradient(90deg, transparent, rgba(11,19,15,0.06) 50%, transparent)`,
                  opacity: 1,
                  flexShrink: 0,
                }}
              />
            ))}
            {/* Zero baseline — solid, connected to Y 0 (§12) */}
            <div
              style={{
                height: 1,
                background: 'rgba(11,19,15,0.08)',
                flexShrink: 0,
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              minWidth: 0,
              height: '100%',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {children}
          </div>
        </div>
        {/* X-axis spacer: reserved 24px aligns with bars' labels */}
        <div style={{ height: paddingBottom, flexShrink: 0, minWidth: 0 }} aria-hidden="true" />
      </div>
    </div>
  );
}
