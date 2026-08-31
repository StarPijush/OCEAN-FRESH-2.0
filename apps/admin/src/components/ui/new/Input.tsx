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
      appearance = 'dark',
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

    const isLight = appearance === 'light';

    // Unified premium sizing — editorial height ~44-46px, consistent across appearances
    const sizeStyles: Record<InputSize, React.CSSProperties> = isLight
      ? {
          sm: { padding: '10px 14px', fontSize: '13px' },
          md: { padding: '13px 16px', fontSize: '14px' },
          lg: { padding: '14px 16px', fontSize: '14px' },
        }
      : {
          sm: { padding: '8px 12px', fontSize: '13px' },
          md: { padding: '13px 14px', fontSize: '14px' },
          lg: { padding: '14px 16px', fontSize: '14px' },
        };

    // Both appearances now render premium navy-dark inputs for the deep-navy auth shell.
    // isLight retains a subtle distinction for legacy callers but shares the same
    // editorial language: dark inset, teal focus, 6px radius — never 9999 pill.
    const baseStyles: React.CSSProperties = isLight
      ? {
          width: '100%',
          background: 'rgba(7, 21, 38, 0.72)',
          backgroundColor: 'rgba(7, 21, 38, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '6px',
          color: 'var(--color-text-primary, #f2eee6)',
          fontFamily: 'var(--font-ui)',
          outline: 'none',
          transition: 'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out)',
          ...sizeStyles[size],
        }
      : {
          width: '100%',
          background: 'var(--color-bg, #0d0f12)',
          border: '1px solid var(--color-border2, rgba(255,255,255,0.12))',
          borderRadius: '6px',
          color: 'var(--color-cream, #f0ebe0)',
          fontFamily: 'var(--font-ui)',
          outline: 'none',
          transition: 'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out)',
          ...sizeStyles[size],
        };

    const focusStyles: React.CSSProperties = isLight
      ? {
          borderColor: 'var(--color-teal, #27c3c8)',
          boxShadow: '0 0 0 3px rgba(39,195,200,0.16)',
        }
      : {
          borderColor: 'var(--color-teal, #27c3c8)',
          boxShadow: '0 0 0 3px rgba(39,195,200,0.16)',
        };

    const errorStyles: React.CSSProperties = isLight
      ? {
          borderColor: 'var(--color-warn, #e07a65)',
          boxShadow: '0 0 0 3px rgba(224,122,101,0.16)',
        }
      : {
          borderColor: 'var(--color-warn, #e07a65)',
          boxShadow: '0 0 0 3px rgba(224,122,101,0.16)',
        };

    const disabledStyles: React.CSSProperties = {
      opacity: 0.5,
      cursor: 'not-allowed',
    };

    const labelColor = isLight ? '#aeb9c8' : 'var(--color-text-secondary, #9ca3af)';
    const toggleColor = isLight ? '#aeb9c8' : 'var(--color-muted2)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', ...style }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              lineHeight: '1.5',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: labelColor,
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
                right: isLight ? '8px' : '6px',
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
                (e.currentTarget as HTMLButtonElement).style.color = isLight
                  ? 'var(--color-text-primary, #f2eee6)'
                  : 'var(--color-cream)';
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
