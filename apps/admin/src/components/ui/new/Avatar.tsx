export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'square';
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  className = '',
  style,
}) => {
  const sizeStyles: Record<AvatarSize, React.CSSProperties> = {
    xs: { width: '24px', height: '24px', fontSize: '10px' },
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '40px', height: '40px', fontSize: '14px' },
    lg: { width: '56px', height: '56px', fontSize: '18px' },
    xl: { width: '72px', height: '72px', fontSize: '24px' },
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
    background: 'var(--color-aqua-dim)',
    color: 'var(--color-aqua)',
    fontFamily: 'var(--font-ui)',
    fontWeight: 600,
    overflow: 'hidden',
    flexShrink: 0,
    ...sizeStyles[size],
    ...style,
  };

  if (src) {
    return <img src={src} alt={alt || name || 'Avatar'} className={className} style={baseStyles} />;
  }

  return (
    <div className={className} style={baseStyles} aria-label={name}>
      {name ? getInitials(name) : '?'}
    </div>
  );
};
