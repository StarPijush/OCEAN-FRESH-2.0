import type { Product } from '@oceanfresh/shared';

interface Props {
  products: Product[];
  categoryNames?: (id: string) => string;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onToggleStatus?: (p: Product) => void;
  onToggleFeatured?: (p: Product) => void;
}

export function ProductList({ products, onEdit, onDelete }: Props) {
  if (!products.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#879A91',
          background: '#FFFFFF',
          border: '1px solid rgba(11,19,15,0.06)',
          borderRadius: 18,
          margin: '0 24px 24px',
          boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.35 }}>🐟</div>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#0B130F',
            marginBottom: 6,
          }}
        >
          No products found
        </div>
        <div
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#6C7E75' }}
        >
          Try a different search or filter.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 24px' }}>
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(11,19,15,0.06)',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            minHeight: 76,
            boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
            transition: 'box-shadow 150ms var(--ease-out), border-color 150ms var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(11,19,15,0.04)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,19,15,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(11,19,15,0.02)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,19,15,0.06)';
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              overflow: 'hidden',
              background: '#F8FAF9',
              border: '1px solid rgba(11,19,15,0.06)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {p.thumbnail ? (
              <img
                src={p.thumbnail}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 20, color: '#6C7E75' }}>🐟</span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#0B130F',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: '#0d2035',
                lineHeight: 1.2,
              }}
            >
              ₹{p.price}{' '}
              <span style={{ fontWeight: 500, color: '#6C7E75', fontSize: 11 }}>/ kg</span>
              {p.status === 'OUT_OF_STOCK' ? (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#EF4444',
                    background: 'rgba(239,68,68,0.08)',
                    borderRadius: 6,
                    padding: '2px 6px',
                  }}
                >
                  Out of stock
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onEdit(p)}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                border: '1px solid rgba(11,19,15,0.08)',
                background: '#FFFFFF',
                color: '#0B130F',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                minWidth: 72,
                textAlign: 'center',
                transition: 'all 150ms var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#F8FAF9';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d2035';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(11,19,15,0.08)';
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(p)}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                border: '1px solid rgba(239,68,68,0.14)',
                background: 'rgba(239,68,68,0.08)',
                color: '#EF4444',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                minWidth: 72,
                textAlign: 'center',
                transition: 'all 150ms var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#EF4444';
                (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
