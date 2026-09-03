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
    <div style={{ flex: 1, background: '#F4F6F5', minHeight: '100%' }}>
      <div style={{ padding: '32px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#0B130F',
              lineHeight: 1.2,
            }}
          >
            Categories
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              color: '#6C7E75',
              marginTop: 4,
            }}
          >
            Browse catalog structure — categories are managed via the product catalog.
          </div>
        </div>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(11,19,15,0.06)',
            borderRadius: 18,
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
            />
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              color: '#879A91',
            }}
          >
            {categories.isLoading
              ? 'Loading…'
              : `${items.length} ${items.length === 1 ? 'category' : 'categories'} · ${categories.data?.length ?? 0} total`}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(11,19,15,0.06)',
                  borderRadius: 18,
                  padding: 20,
                  boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
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
                background: '#FFFFFF',
                border: '1px solid rgba(11,19,15,0.06)',
                borderRadius: 18,
                padding: 16,
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#F8FAF9',
                  border: '1px solid rgba(11,19,15,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#6C7E75',
                }}
              >
                📁
              </div>
              <div
                style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: '#0B130F',
                  }}
                >
                  {cat.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12,
                    color: '#6C7E75',
                  }}
                >
                  {cat.slug} · {cat.description || 'No description'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 4,
                    fontSize: 11,
                    color: '#6C7E75',
                  }}
                >
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 20,
                      background: cat.status === 'ACTIVE' ? 'rgba(34,197,94,0.10)' : '#F8FAF9',
                      border: '1px solid rgba(11,19,15,0.06)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 10,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: cat.status === 'ACTIVE' ? '#22C55E' : '#6C7E75',
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
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 11,
                    color: '#879A91',
                  }}
                >
                  Level {cat.level}
                </span>
                {cat.featured ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(74,184,193,0.10)',
                      border: '1px solid rgba(74,184,193,0.14)',
                      borderRadius: 20,
                      padding: '3px 8px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: '#0d2035',
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
