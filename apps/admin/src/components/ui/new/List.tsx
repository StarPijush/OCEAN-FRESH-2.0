import type { ReactNode } from 'react';

export interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  separator?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function List<T>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  emptyMessage = 'No items',
  emptyAction,
  separator = true,
  className = '',
  style,
}: ListProps<T>) {
  if (loading) {
    return (
      <div style={{ ...style }} className={className}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--space-lg)',
              borderBottom: separator ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div
              className="animate-shimmer"
              style={{
                height: '60px',
                borderRadius: 'var(--radius-card)',
                background:
                  'linear-gradient(90deg, var(--color-surface2) 25%, var(--color-border) 50%, var(--color-surface2) 75%)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-xxxl)',
          textAlign: 'center',
          color: 'var(--color-muted2)',
          ...style,
        }}
        className={className}
      >
        <p style={{ fontSize: 'var(--text-body-size)', marginBottom: 'var(--space-md)' }}>
          {emptyMessage}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div style={{ ...style }} className={className}>
      {data.map((item, index) => (
        <div
          key={keyExtractor(item)}
          style={{
            padding: 'var(--space-lg)',
            borderBottom:
              separator && index < data.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
