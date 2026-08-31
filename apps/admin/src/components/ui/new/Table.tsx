import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sticky?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  renderRowActions?: (row: T) => ReactNode;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  emptyAction,
  onRowClick,
  striped = false,
  bordered = false,
  className = '',
  style,
  renderRowActions,
}: TableProps<T>) {
  if (loading) {
    return (
      <div style={{ overflow: 'auto', ...style }} className={className}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: 'var(--space-md)',
                    textAlign: 'left',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-label-sm-size)',
                    lineHeight: 'var(--text-label-sm-line)',
                    fontWeight: 'var(--text-label-sm-weight)',
                    letterSpacing: 'var(--text-label-sm-tracking)',
                    textTransform: 'var(--text-label-sm-transform)',
                    color: 'var(--color-muted)',
                    background: 'var(--color-surface2)',
                    borderBottom: '1px solid var(--color-border)',
                    whiteSpace: 'nowrap',
                    ...(col.width && { width: col.width }),
                    ...(col.minWidth && { minWidth: col.minWidth }),
                    ...(col.maxWidth && { maxWidth: col.maxWidth }),
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: 'var(--space-md)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      className="animate-shimmer"
                      style={{
                        height: '16px',
                        borderRadius: '4px',
                        background:
                          'linear-gradient(90deg, var(--color-surface2) 25%, var(--color-border) 50%, var(--color-surface2) 75%)',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
    <div style={{ overflow: 'auto', ...style }} className={className}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: 'var(--space-md)',
                  textAlign: col.align || 'left',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-label-sm-size)',
                  lineHeight: 'var(--text-label-sm-line)',
                  fontWeight: 'var(--text-label-sm-weight)',
                  letterSpacing: 'var(--text-label-sm-tracking)',
                  textTransform: 'var(--text-label-sm-transform)',
                  color: 'var(--color-muted)',
                  background: 'var(--color-surface2)',
                  borderBottom: '1px solid var(--color-border)',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  ...(col.width && { width: col.width }),
                  ...(col.minWidth && { minWidth: col.minWidth }),
                  ...(col.maxWidth && { maxWidth: col.maxWidth }),
                  ...(col.sticky && { position: 'sticky', left: 0, zIndex: 1 }),
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              style={{
                background:
                  striped && rowIndex % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                transition: 'background 150ms var(--ease-out)',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                  e.preventDefault();
                  onRowClick(row);
                }
              }}
              tabIndex={onRowClick ? 0 : -1}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: 'var(--space-md)',
                    textAlign: col.align || 'left',
                    borderBottom: bordered ? '1px solid var(--color-border)' : 'none',
                    verticalAlign: 'middle',
                    ...(col.sticky && {
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      background: 'var(--color-surface)',
                    }),
                  }}
                >
                  {col.render
                    ? col.render(row, rowIndex)
                    : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                </td>
              ))}
              {renderRowActions && (
                <td
                  style={{
                    padding: 'var(--space-md)',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    borderBottom: bordered ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  {renderRowActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
