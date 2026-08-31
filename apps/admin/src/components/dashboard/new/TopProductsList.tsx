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
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: 20,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 400,
            color: 'var(--color-cream)',
          }}
        >
          Top Products
        </span>
        <div style={{ fontSize: 12, color: 'var(--color-muted2)', marginTop: 4 }}>
          Best sellers this period
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-muted2)' }}>
          No data yet
        </div>
      </div>
    );
  }
  const max = topProducts[0]?.qty ?? 1;
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 400,
            color: 'var(--color-cream)',
            letterSpacing: '-0.02em',
          }}
        >
          Top Products
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-muted2)' }}>Best sellers this period</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {topProducts.map((p, i) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                background: i === 0 ? 'var(--color-aqua)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${i === 0 ? 'var(--color-aqua)' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: i === 0 ? 'var(--color-bg)' : 'var(--color-muted2)',
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-cream)',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.name}
            </span>
            <div
              style={{
                width: 80,
                height: 4,
                borderRadius: 999,
                background: 'var(--color-surface2)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--color-aqua)',
                  width: `${Math.round((p.qty / max) * 100)}%`,
                  borderRadius: 999,
                }}
              />
            </div>
            <span
              style={{
                width: 36,
                textAlign: 'right',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-muted2)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {p.qty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
