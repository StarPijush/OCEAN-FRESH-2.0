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

    const sizeStyles: Record<InputSize, React.CSSProperties> = {
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
            htmlFor={inputId}
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
                right: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--color-muted2)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
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

Input.displayName = 'Input';
