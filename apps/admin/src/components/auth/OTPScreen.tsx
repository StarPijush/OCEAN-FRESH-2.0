import { useCallback, useEffect, useRef } from 'react';

interface Props {
  mobile: string;
  onVerify: (otp: string) => boolean;
  onResend: () => void;
  onBack: () => void;
  error: string;
}

export function OTPScreen({ mobile, onVerify, onResend, onBack, error }: Props) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((i: number) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    setTimeout(() => focusIndex(0), 100);
  }, [focusIndex]);

  const handleInput = (i: number, val: string) => {
    if (val) {
      if (i < 5) focusIndex(i + 1);
      else {
        const otp = inputsRef.current.map((el) => el?.value ?? '').join('');
        if (otp.length === 6) onVerify(otp);
      }
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputsRef.current[i]?.value && i > 0) {
      focusIndex(i - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (data) {
      data.split('').forEach((char, idx) => {
        if (inputsRef.current[idx]) {
          const el = inputsRef.current[idx] as HTMLInputElement;
          el.value = char;
        }
      });
      const next = Math.min(data.length, 5);
      focusIndex(next);
      e.preventDefault();
    }
  };

  return (
    <div className="auth-screen auth-card">
      <div className="auth-logo">
        Ocean<span>Fresh</span>
      </div>
      <div className="auth-eyebrow">Two-Step Verification</div>
      <h2 className="auth-title">Enter OTP</h2>
      <p className="auth-sub">
        A 6-digit OTP has been sent to <strong style={{ color: 'var(--cream)' }}>{mobile}</strong>.
        Check your SMS inbox.
      </p>

      <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>

      <div className="otp-row" style={{ margin: '8px 0 16px' }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            className="otp-input"
            type="tel"
            maxLength={1}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : undefined}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
          />
        ))}
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={() => {
          const otp = inputsRef.current.map((el) => el?.value ?? '').join('');
          onVerify(otp);
        }}
      >
        Verify OTP →
      </button>

      <p className="otp-note">
        Didn&apos;t receive it?{' '}
        <span className="auth-link" onClick={onResend}>
          Resend OTP
        </span>
      </p>

      <div style={{ textAlign: 'center' }}>
        <span className="auth-link" onClick={onBack}>
          ← Back to login
        </span>
      </div>
    </div>
  );
}
