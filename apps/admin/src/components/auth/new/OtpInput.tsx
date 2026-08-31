import { useRef } from 'react';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

export function OtpInput({ value, onChange, onComplete }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, '').slice(0, 6).split('');

  const setDigit = (idx: number, char: string) => {
    const arr = value.padEnd(6, '').split('').slice(0, 6);
    arr[idx] = char;
    const next = arr.join('').trimEnd();
    onChange(next);
    return next;
  };

  return (
    <div style={rowStyle}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digits[i] ?? ''}
          autoFocus={i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          onChange={(e) => {
            const ch = e.target.value.replace(/[^0-9]/g, '').slice(-1);
            if (!ch) {
              setDigit(i, '');
              return;
            }
            const next = setDigit(i, ch);
            if (i < 5) refs.current[i + 1]?.focus();
            if (next.replace(/\s/g, '').length === 6) onComplete?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (pasted) {
              e.preventDefault();
              onChange(pasted);
              const idx = Math.min(pasted.length, 5);
              refs.current[idx]?.focus();
              if (pasted.length === 6) onComplete?.();
            }
          }}
          style={inputStyle}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--color-aqua)';
            (e.target as HTMLInputElement).style.boxShadow =
              '0 0 0 4px var(--color-aqua-dim), inset 0 2px 4px rgba(0,0,0,0.1)';
            (e.target as HTMLInputElement).style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)';
            (e.target as HTMLInputElement).style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
            (e.target as HTMLInputElement).style.transform = 'none';
          }}
        />
      ))}
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  justifyContent: 'center',
  margin: '8px 0 16px',
};

const inputStyle: React.CSSProperties = {
  width: 44,
  height: 56,
  textAlign: 'center',
  fontSize: '1.5rem',
  fontWeight: 700,
  background: 'var(--color-surface2)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-cream)',
  outline: 'none',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
};
