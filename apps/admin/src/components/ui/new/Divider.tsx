import type { ReactNode } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
  orientation?: DividerOrientation;
  label?: ReactNode;
  dashed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  dashed = false,
  className = '',
  style,
}) => {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderTop: `1px ${dashed ? 'dashed' : 'solid'} var(--color-border)`,
    ...style,
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={className}
        style={{
          ...baseStyles,
          borderTop: 'none',
          borderLeft: `1px ${dashed ? 'dashed' : 'solid'} var(--color-border)`,
          height: '100%',
          minHeight: '100%',
        }}
      />
    );
  }

  if (label) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          ...style,
        }}
      >
        <div style={{ flex: 1, ...baseStyles }} />
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--text-body-xs-size)',
            color: 'var(--color-muted)',
            whiteSpace: 'nowrap',
            padding: '0 var(--space-sm)',
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, ...baseStyles }} />
      </div>
    );
  }

  return <hr className={className} style={baseStyles} />;
};
