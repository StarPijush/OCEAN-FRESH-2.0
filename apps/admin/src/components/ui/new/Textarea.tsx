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
      sm: { padding: '8px 10px', fontSize: '13px', minHeight: '80px' },
      md: { padding: '12px 14px', fontSize: '14px', minHeight: '100px' },
      lg: { padding: '14px 16px', fontSize: '16px', minHeight: '120px' },
    };

    const baseStyles: React.CSSProperties = {
      width: '100%',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border2)',
      borderRadius: 'var(--radius-input)',
      color: 'var(--color-cream)',
      fontFamily: 'var(--font-ui)',
      outline: 'none',
      resize: autoResize ? 'none' : 'vertical',
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
        {label && (
          <label
            htmlFor={textareaId}
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
        {(showCharCount || maxLength) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: 'var(--text-body-xs-size)',
              color: 'var(--color-muted2)',
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
