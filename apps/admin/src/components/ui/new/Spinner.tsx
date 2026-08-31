export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: 'aqua' | 'cream' | 'white' | 'green' | 'warn';
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'aqua',
  className = '',
  style,
  'aria-label': ariaLabel = 'Loading',
}) => {
  const sizeStyles: Record<SpinnerSize, React.CSSProperties> = {
    xs: { width: '12px', height: '12px', borderWidth: '2px' },
    sm: { width: '16px', height: '16px', borderWidth: '2px' },
    md: { width: '24px', height: '24px', borderWidth: '3px' },
    lg: { width: '32px', height: '32px', borderWidth: '3px' },
    xl: { width: '48px', height: '48px', borderWidth: '4px' },
  };

  const colorMap = {
    aqua: 'var(--color-aqua)',
    cream: 'var(--color-cream)',
    white: 'var(--color-white)',
    green: 'var(--color-green)',
    warn: 'var(--color-warn)',
  };

  const baseStyles: React.CSSProperties = {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderTopColor: colorMap[color],
    animation: 'spin 1s linear infinite',
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span
      className={className}
      style={baseStyles}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <span
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {ariaLabel}
      </span>
    </span>
  );
};
