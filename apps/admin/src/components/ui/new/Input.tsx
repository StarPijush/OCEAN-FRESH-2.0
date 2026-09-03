import { forwardRef, type InputHTMLAttributes, type ReactNode, useState } from 'react';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  secureToggle?: boolean;
  appearance?: 'dark' | 'light';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      leftElement,
      rightElement,
      secureToggle = false,
      appearance: _appearance = 'dark',
      type = 'text',
      id,
      className = '',
      style,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const [showPassword, setShowPassword] = useState(false);
    const effectiveType =
      secureToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    // Spark reference: both appearances now light (white bg, 14radius, 0.12 border)
    const sizeStyles: Record<InputSize, React.CSSProperties> = {
      sm: { padding: '8px 14px', fontSize: '13px' },
      md: { padding: '12px 16px', fontSize: '14px' },
      lg: { padding: '14px 16px', fontSize: '14px' },
    };

    const baseStyles: React.CSSProperties = {
      width: '100%',
      background: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      border: '1px solid rgba(11,19,15,0.12)',
      borderRadius: 'var(--radius-input)',
      color: '#0B130F',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      outline: 'none',
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

    const labelColor = '#0B130F';
    const toggleColor = '#6C7E75';

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
            htmlFor={inputId}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              lineHeight: 1.4,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: labelColor,
              marginBottom: 0,
              display: 'block',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-warn)', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftElement && (
            <span
              style={{
                position: 'absolute',
                left: '14px',
                pointerEvents: 'none',
                color: 'var(--color-muted2)',
                zIndex: 1,
              }}
            >
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            className={className}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
            style={{
              ...baseStyles,
              paddingLeft: leftElement ? '44px' : undefined,
              paddingRight: rightElement || secureToggle ? '44px' : undefined,
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
          />
          {secureToggle && (
            <button
              type="button"
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: toggleColor,
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                transition: 'color 150ms var(--ease-out)',
              }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#0B130F';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = toggleColor;
              }}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.59 9.59 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
          {rightElement && (
            <span
              style={{
                position: 'absolute',
                right: secureToggle ? '36px' : '10px',
                pointerEvents: 'none',
                color: 'var(--color-muted2)',
                zIndex: 1,
              }}
            >
              {rightElement}
            </span>
          )}
        </div>
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

Input.displayName = 'Input';
