export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style,
}) => {
  const baseStyles: React.CSSProperties = {
    background:
      'linear-gradient(90deg, var(--color-surface2) 25%, var(--color-border) 50%, var(--color-surface2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: 'var(--radius-card)',
    ...style,
  };

  const variantStyles: Record<SkeletonVariant, React.CSSProperties> = {
    text: {
      height: height || '16px',
      width: width || '100%',
      borderRadius: '4px',
    },
    circular: {
      width: width || '40px',
      height: height || '40px',
      borderRadius: '50%',
    },
    rectangular: {
      width: width || '100%',
      height: height || '100px',
    },
    card: {
      width: width || '100%',
      height: height || '200px',
    },
    'table-row': {
      width: width || '100%',
      height: height || '60px',
    },
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={className}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}
      >
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            style={{
              ...baseStyles,
              ...variantStyles.text,
              width: i === lines - 1 && width ? width : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={className} style={{ ...baseStyles, ...variantStyles[variant] }} />;
};
