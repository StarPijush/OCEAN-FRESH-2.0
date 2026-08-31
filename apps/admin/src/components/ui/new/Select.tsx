import { forwardRef, type SelectHTMLAttributes } from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: SelectSize;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      options,
      placeholder,
      id,
      className = '',
      style,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    const sizeStyles: Record<SelectSize, React.CSSProperties> = {
      sm: { padding: '8px 10px', fontSize: '13px' },
      md: { padding: '12px 14px', fontSize: '14px' },
      lg: { padding: '14px 16px', fontSize: '16px' },
    };

    const baseStyles: React.CSSProperties = {
      width: '100%',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border2)',
      borderRadius: 'var(--radius-input)',
      color: 'var(--color-cream)',
      fontFamily: 'var(--font-ui)',
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '40px',
      transition: 'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out)',
      ...sizeStyles[size],
    };

    const focusStyles: React.CSSProperties = {
      borderColor: 'var(--color-aqua)',
      boxShadow: 'var(--shadow-focus)',
    };

    const errorStyles: React.CSSProperties = {
      borderColor: 'var(--color-warn)',
      boxShadow: 'var(--shadow-focus-error)',
    };

    const disabledStyles: React.CSSProperties = {
      opacity: 0.5,
      cursor: 'not-allowed',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-label-size)',
              lineHeight: 'var(--text-label-line)',
              fontWeight: 'var(--text-label-weight)',
              letterSpacing: 'var(--text-label-tracking)',
              textTransform: 'var(--text-label-transform)',
              color: 'var(--color-muted)',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-warn)', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={className}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
          style={{
            ...baseStyles,
            ...(error ? errorStyles : {}),
            ...(disabled ? disabledStyles : {}),
          }}
          onFocus={(e) => {
            if (!error && !disabled) {
              Object.assign(e.currentTarget.style, focusStyles);
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            const base = error ? errorStyles : baseStyles;
            Object.assign(e.currentTarget.style, base);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={errorId}
            role="alert"
            style={{
              fontSize: 'var(--text-body-xs-size)',
              lineHeight: 'var(--text-body-xs-line)',
              color: 'var(--color-warn)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={hintId}
            style={{
              fontSize: 'var(--text-body-xs-size)',
              lineHeight: 'var(--text-body-xs-line)',
              color: 'var(--color-muted2)',
              margin: 0,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
