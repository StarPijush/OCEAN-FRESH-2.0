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
      sm: { padding: '8px 14px', fontSize: '13px' },
      md: { padding: '12px 16px', fontSize: '14px' },
      lg: { padding: '14px 16px', fontSize: '14px' },
    };

    const baseStyles: React.CSSProperties = {
      width: '100%',
      minWidth: 0,
      background: '#FFFFFF',
      border: '1px solid rgba(11,19,15,0.12)',
      borderRadius: 'var(--radius-input)',
      color: '#0B130F',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230d2035' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '40px',
      transition: 'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out)',
      ...sizeStyles[size],
    };

    const focusStyles: React.CSSProperties = {
      borderColor: '#0d2035',
      boxShadow: '0 0 0 3px rgba(13,32,53,0.08)',
    };

    const errorStyles: React.CSSProperties = {
      borderColor: '#EF4444',
      boxShadow: '0 0 0 3px rgba(239,68,68,0.08)',
    };

    const disabledStyles: React.CSSProperties = {
      opacity: 0.5,
      cursor: 'not-allowed',
    };

    const showError = Boolean(error);
    const showHint = Boolean(hint && !error);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minWidth: 0,
          width: '100%',
          ...style,
        }}
      >
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              lineHeight: 1.4,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#0B130F',
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
        <div
          aria-live="polite"
          style={{
            minHeight: showError || showHint ? 18 : 0,
            transition: 'min-height 150ms var(--ease-out)',
          }}
        >
          {error ? (
            <p
              id={errorId}
              role="alert"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11,
                lineHeight: 1.4,
                color: '#EF4444',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span aria-hidden="true">⚠</span>
              {error}
            </p>
          ) : hint ? (
            <p
              id={hintId}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11,
                lineHeight: 1.4,
                color: '#6C7E75',
                margin: 0,
              }}
            >
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';
