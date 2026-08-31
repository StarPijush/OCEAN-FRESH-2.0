import { forwardRef, type InputHTMLAttributes } from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  size?: CheckboxSize;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = 'md',
      description,
      id,
      className = '',
      style,
      disabled,
      required,
      checked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    const sizeStyles: Record<
      CheckboxSize,
      { width: string; height: string; thumbSize: string; thumbOffset: string }
    > = {
      sm: { width: '28px', height: '16px', thumbSize: '12px', thumbOffset: '2px' },
      md: { width: '36px', height: '20px', thumbSize: '16px', thumbOffset: '2px' },
      lg: { width: '44px', height: '24px', thumbSize: '20px', thumbOffset: '2px' },
    };

    const sizes = sizeStyles[size];

    const trackStyles: React.CSSProperties = {
      position: 'relative',
      width: sizes.width,
      height: sizes.height,
      borderRadius: 'var(--radius-toggle)',
      background: disabled
        ? 'var(--color-surface2)'
        : checked
          ? 'var(--color-aqua)'
          : 'var(--color-surface2)',
      border:
        '1px solid ' +
        (disabled ? 'var(--color-border)' : checked ? 'var(--color-aqua)' : 'var(--color-border2)'),
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 200ms var(--ease-out)',
      flexShrink: 0,
    };

    const thumbStyles: React.CSSProperties = {
      position: 'absolute',
      top: sizes.thumbOffset,
      left: checked ? `calc(100% - ${sizes.thumbSize} - ${sizes.thumbOffset})` : sizes.thumbOffset,
      width: sizes.thumbSize,
      height: sizes.thumbSize,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'transform 200ms var(--ease-out)',
    };

    return (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        className={className}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: 'none',
            }}
            {...props}
          />
          <div style={trackStyles} aria-hidden="true">
            <div style={thumbStyles} />
          </div>
        </div>
        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            {label && (
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-body-size)',
                  lineHeight: 'var(--text-body-line)',
                  fontWeight: 500,
                  color: 'var(--color-cream)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-body-xs-size)',
                  lineHeight: 'var(--text-body-xs-line)',
                  color: 'var(--color-muted2)',
                }}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
