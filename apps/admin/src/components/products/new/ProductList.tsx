import type { Product } from '@oceanfresh/shared';

import { Badge } from '../../ui/new/Badge';
import { IconButton } from '../../ui/new/IconButton';

interface Props {
  products: Product[];
  categoryNames: (id: string) => string;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onToggleStatus?: (p: Product) => void;
  onToggleFeatured?: (p: Product) => void;
}

function statusVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'OUT_OF_STOCK':
      return 'warn' as const;
    case 'DRAFT':
      return 'neutral' as const;
    case 'ARCHIVED':
      return 'neutral' as const;
    default:
      return 'info' as const;
  }
}

export function ProductList({ products, categoryNames, onEdit, onDelete }: Props) {
  if (!products.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted2)' }}>
        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🐟</div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            color: 'var(--color-cream)',
            marginBottom: 6,
          }}
        >
          No products yet
        </div>
        <div style={{ fontSize: 13 }}>Add your first product to get started.</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hide-mobile" style={{ display: 'none' }}>
        <style>{`@media(min-width:768px){ .hide-mobile{ display:block !important; } .show-mobile{ display:none !important; } }`}</style>
      </div>
      <div style={{ display: 'none' }} className="hide-mobile">
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr 140px 110px 90px 80px 100px',
              gap: 12,
              padding: '12px 16px',
              background: 'var(--color-surface2)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              fontWeight: 600,
            }}
          >
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Status</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 140px 110px 90px 80px 100px',
                gap: 12,
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--color-surface2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'var(--color-muted)',
                    }}
                  >
                    🐟
                  </span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-cream)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-muted2)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.description?.slice(0, 40) ?? ''}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
                {categoryNames(p.categoryId) || 'Uncategorized'}
              </span>
              <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-aqua)' }}>
                ₹{p.price}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-muted2)' }}>{p.stock}</span>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <IconButton aria-label="Edit" onClick={() => onEdit(p)}>
                  ✎
                </IconButton>
                <IconButton aria-label="Delete" variant="danger" onClick={() => onDelete(p)}>
                  🗑
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="show-mobile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: 'var(--color-surface2)',
                    border: '1px solid var(--color-border)',
                    flexShrink: 0,
                  }}
                >
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        fontSize: 24,
                      }}
                    >
                      🐟
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-cream)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
                    {categoryNames(p.categoryId)}
                  </div>
                </div>
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 12,
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--color-muted)' }}>Price</span>
                <span style={{ fontWeight: 600, color: 'var(--color-aqua)' }}>
                  ₹{p.price} · Stock {p.stock}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onEdit(p)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border2)',
                    background: 'var(--color-surface2)',
                    color: 'var(--color-cream)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-warn-dim)',
                    color: 'var(--color-warn)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
