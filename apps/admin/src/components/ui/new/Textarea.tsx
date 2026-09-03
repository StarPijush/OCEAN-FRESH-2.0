import { forwardRef, type TextareaHTMLAttributes } from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: TextareaSize;
  autoResize?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      autoResize = false,
      maxLength,
      showCharCount = false,
      id,
      className = '',
      style,
      disabled,
      required,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const hintId = hint ? `${textareaId}-hint` : undefined;

    const sizeStyles: Record<TextareaSize, React.CSSProperties> = {
      sm: { padding: '8px 14px', fontSize: '13px', minHeight: '80px' },
      md: { padding: '12px 16px', fontSize: '14px', minHeight: '100px' },
      lg: { padding: '14px 16px', fontSize: '14px', minHeight: '120px' },
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
      resize: autoResize ? 'none' : 'vertical',
      boxSizing: 'border-box',
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
      }
      onChange?.(e);
    };

    const showError2 = Boolean(error);
    const showHint2 = Boolean(hint && !error);
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
            htmlFor={textareaId}
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
        <div style={{ position: 'relative' }}>
          <textarea
            ref={ref}
            id={textareaId}
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
            onChange={handleChange}
            value={value}
            {...props}
          />
        </div>
        <div
          aria-live="polite"
          style={{ minHeight: showError2 || showHint2 || showCharCount || maxLength ? 18 : 0 }}
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
        {(showCharCount || maxLength) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              color: '#6C7E75',
            }}
          >
            {maxLength ? (
              <>
                {typeof value === 'string' ? value.length : 0} / {maxLength}
              </>
            ) : (
              <span>{typeof value === 'string' ? value.length : 0}</span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
