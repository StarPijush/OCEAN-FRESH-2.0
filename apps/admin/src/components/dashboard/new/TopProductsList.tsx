interface TopProduct {
  name: string;
  qty: number;
}
interface Props {
  topProducts: TopProduct[];
}

export function TopProductsList({ topProducts }: Props) {
  if (!topProducts.length) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(11,19,15,0.06)',
          borderRadius: 24,
          padding: '1.75rem',
          boxShadow: '0 10px 30px rgba(11,19,15,0.04)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0B130F',
              letterSpacing: '-0.025em',
            }}
          >
            Top Products
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              color: '#6C7E75',
            }}
          >
            Best sellers this period
          </span>
        </div>
        <div
          style={{
            padding: '24px 0',
            textAlign: 'center',
            color: '#6C7E75',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          No data yet
        </div>
      </div>
    );
  }
  const max = topProducts[0]?.qty ?? 1;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(11,19,15,0.06)',
        borderRadius: 24,
        padding: 'clamp(18px, 4vw, 1.75rem)',
        boxShadow: '0 10px 30px rgba(11,19,15,0.04)',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#0B130F',
            letterSpacing: '-0.025em',
          }}
        >
          Top Products
        </span>
        <span
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: '#6C7E75' }}
        >
          Best sellers this period
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        {topProducts.map((p, i) => {
          const pct = Math.round((p.qty / max) * 100);
          return (
            <div
              key={p.name}
              style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  background: i === 0 ? '#0d2035' : i === 1 ? '#0d2035' : '#FFFFFF',
                  border: `1px solid ${i <= 1 ? '#0d2035' : 'rgba(11,19,15,0.08)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: i <= 1 ? '#FFFFFF' : '#0B130F',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0B130F',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {p.name}
              </span>
              <div
                style={{
                  width: 'clamp(48px, 18vw, 96px)',
                  height: 8,
                  borderRadius: 9999,
                  background: '#F4F6F5',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(11,19,15,0.04)',
                  flexBasis: 'clamp(48px, 18vw, 96px)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background:
                      i === 0
                        ? '#0d2035'
                        : i === 1
                          ? 'rgba(13,32,53,0.85)'
                          : i === 2
                            ? 'rgba(74,184,193,0.85)'
                            : 'rgba(74,184,193,0.55)',
                    width: `${pct}%`,
                    borderRadius: 9999,
                    transition: 'width 600ms var(--ease-out)',
                  }}
                />
              </div>
              <span
                style={{
                  width: 36,
                  textAlign: 'right',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0B130F',
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {p.qty}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
