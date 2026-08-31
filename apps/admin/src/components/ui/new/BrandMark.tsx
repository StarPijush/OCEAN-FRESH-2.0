export type BrandMarkSize = 'sm' | 'md' | 'lg';

export interface BrandMarkProps {
  size?: BrandMarkSize;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '', style }) => {
  const sizeStyles: Record<BrandMarkSize, React.CSSProperties> = {
    sm: { fontSize: '18px', letterSpacing: '0.08em' },
    md: { fontSize: '22px', letterSpacing: '0.1em' },
    lg: { fontSize: '28px', letterSpacing: '0.1em' },
  };

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 400,
        textTransform: 'uppercase',
        color: 'var(--color-cream)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        ...sizeStyles[size],
        ...style,
      }}
    >
      Ocean<span style={{ color: 'var(--color-aqua)' }}>Fresh</span>
    </span>
  );
};
