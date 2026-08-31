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
    <div className="otp-row" style={rowStyle}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          className="otp-input"
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
            (e.target as HTMLInputElement).style.borderColor = '#4ab8c1';
            (e.target as HTMLInputElement).style.boxShadow =
              '0 0 0 3px rgba(74,184,193,0.15), inset 0 1px 2px rgba(0,0,0,0.04)';
            (e.target as HTMLInputElement).style.transform = 'translateY(-1px)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = '#e7e5e4';
            (e.target as HTMLInputElement).style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)';
            (e.target as HTMLInputElement).style.transform = 'none';
          }}
        />
      ))}
      <style>{`
        @media (max-width: 430px) {
          .otp-row {
            gap: 8px !important;
          }
          .otp-input {
            width: 38px !important;
            height: 50px !important;
            font-size: 1.25rem !important;
            border-radius: 10px !important;
          }
        }
        @media (max-width: 360px) {
          .otp-row {
            gap: 6px !important;
          }
          .otp-input {
            width: 34px !important;
            height: 46px !important;
            font-size: 1.15rem !important;
          }
        }
        @media (max-width: 320px) {
          .otp-row {
            gap: 5px !important;
          }
          .otp-input {
            width: 30px !important;
            height: 42px !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
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
  background: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: 12,
  color: '#1c1917',
  outline: 'none',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
};
