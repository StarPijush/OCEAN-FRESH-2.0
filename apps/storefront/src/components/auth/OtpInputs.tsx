import { useRef } from 'react';

type OtpInputsProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  hasError?: boolean;
};

export function OtpInputs({
  value,
  onChange,
  onComplete,
  autoFocus,
  disabled,
  hasError,
}: OtpInputsProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <div className="otp-row" role="group" aria-label="Verification code">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] ?? ''}
          disabled={disabled}
          aria-label={`Verification code digit ${i + 1} of 6`}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? 'otp-error' : undefined}
          className={`otp-input${hasError ? ' is-error' : ''}`}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => {
            const digit = e.target.value.replace(/[^0-9]/g, '').slice(-1);
            const chars = Array.from({ length: 6 }, (_, idx) => value[idx] ?? '');
            if (!digit) {
              chars[i] = '';
              onChange(chars.join('').slice(0, 6));
              return;
            }
            chars[i] = digit;
            const nextVal = chars.join('').slice(0, 6);
            onChange(nextVal);
            if (i < 5) {
              refs.current[i + 1]?.focus();
            } else if (nextVal.length === 6 && onComplete) {
              onComplete(nextVal);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              refs.current[i - 1]?.focus();
            }
            if (e.key === 'ArrowLeft' && i > 0) {
              e.preventDefault();
              refs.current[i - 1]?.focus();
            }
            if (e.key === 'ArrowRight' && i < 5) {
              e.preventDefault();
              refs.current[i + 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (!data) return;
            onChange(data);
            const nextIndex = Math.min(data.length, 5);
            refs.current[nextIndex]?.focus();
            if (data.length === 6 && onComplete) onComplete(data);
          }}
          onFocus={(e) => {
            e.currentTarget.select();
          }}
        />
      ))}
    </div>
  );
}
