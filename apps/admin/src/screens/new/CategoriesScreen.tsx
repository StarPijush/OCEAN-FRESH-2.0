import { useDeferredValue, useState } from 'react';

import { EmptyState } from '../../components/ui/new/EmptyState';
import { ErrorState } from '../../components/ui/new/ErrorState';
import { Input } from '../../components/ui/new/Input';
import { Skeleton } from '../../components/ui/new/Skeleton';
import { useCategories } from '../../hooks/use-products';
import { errorToMessage } from '../../utils/error';

export function CategoriesScreen() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const categories = useCategories();
  const query = deferredSearch.trim().toLowerCase();
  const items = (categories.data ?? []).filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ flex: 1, background: 'var(--color-bg)', minHeight: '100%' }}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 300,
            color: 'var(--color-cream)',
          }}
        >
          Categories
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted2)' }}>
          Browse catalog structure — categories are managed via the product catalog.
        </div>
        <div style={{ maxWidth: 360 }}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
          {categories.isLoading
            ? 'Loading…'
            : `${items.length} ${items.length === 1 ? 'category' : 'categories'} · ${categories.data?.length ?? 0} total`}
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Skeleton width="40%" height={16} />
                <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
                <Skeleton width="30%" height={12} style={{ marginTop: 12 }} />
              </div>
            ))}
          </>
        ) : categories.isError ? (
          <ErrorState
            message={errorToMessage(categories.error)}
            onRetry={() => void categories.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={query ? 'No categories found' : 'No categories yet'}
            description={
              query
                ? 'Try a different search term.'
                : 'Categories will appear here once they are created via the database or migration.'
            }
          />
        ) : (
          items.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--color-surface2)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-muted2)',
                }}
              >
                📁
              </div>
              <div
                style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-cream)' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted2)' }}>
                  {cat.slug} · {cat.description || 'No description'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 2,
                    fontSize: 11,
                    color: 'var(--color-muted2)',
                  }}
                >
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 20,
                      background:
                        cat.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--color-border)',
                      fontSize: 10,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: cat.status === 'ACTIVE' ? 'var(--color-green)' : 'var(--color-muted2)',
                    }}
                  >
                    {cat.status}
                  </span>
                  <span>{cat.productCount} products</span>
                  <span>Sort: {cat.sortOrder}</span>
                  <span>{cat.visibility}</span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--color-muted2)' }}>
                  Level {cat.level}
                </span>
                {cat.featured ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(240,180,41,0.15)',
                      border: '1px solid rgba(240,180,41,0.2)',
                      borderRadius: 20,
                      padding: '2px 8px',
                      fontSize: 10,
                      color: 'var(--color-gold)',
                      fontWeight: 600,
                    }}
                  >
                    ★ Featured
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
