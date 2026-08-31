import { forwardRef } from 'react';

export type RadioOrientation = 'horizontal' | 'vertical';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  error?: string;
  hint?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: RadioOrientation;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      label,
      error,
      hint,
      options,
      value,
      onChange,
      orientation = 'horizontal',
      required,
      disabled,
      id,
      className = '',
      style,
    },
    ref,
  ) => {
    const groupId = id || `radiogroup-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${groupId}-error` : undefined;
    const hintId = hint ? `${groupId}-hint` : undefined;

    return (
      <div
        ref={ref}
        className={className}
        style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}
        role="group"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
        aria-invalid={error ? 'true' : 'false'}
      >
        {label && (
          <span
            id={`${groupId}-label`}
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
          </span>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            gap: orientation === 'horizontal' ? '16px' : '8px',
            flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
          }}
        >
          {options.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: option.disabled || disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled || disabled ? 0.5 : 1,
              }}
            >
              <input
                type="radio"
                name={groupId}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={option.disabled || disabled}
                required={required}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: 0,
                  height: 0,
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${value === option.value ? 'var(--color-aqua)' : 'var(--color-border2)'}`,
                  background: value === option.value ? 'var(--color-aqua)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms var(--ease-out)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {value === option.value && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fff',
                    }}
                  />
                )}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--text-body-size)',
                  lineHeight: 'var(--text-body-line)',
                  color: 'var(--color-cream)',
                }}
              >
                {option.label}
              </span>
            </label>
          ))}
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

RadioGroup.displayName = 'RadioGroup';
