import { useEffect, useRef, useState } from 'react';

interface Props {
  onSendOTP: (mobile: string) => Promise<boolean>;
  onBack: () => void;
  error: string;
  loading: boolean;
}

export function ForgotScreen({ onSendOTP, onBack, error, loading }: Props) {
  const [mobile, setMobile] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="auth-screen auth-card">
      <div className="auth-logo">
        Ocean<span>Fresh</span>
      </div>
      <div className="auth-eyebrow">Password Recovery</div>
      <h2 className="auth-title">Reset password</h2>
      <p className="auth-sub">
        Enter your registered mobile number to receive a one-time password.
      </p>

      <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>

      <div className="form-grp">
        <label className="form-lbl">Registered Mobile Number</label>
        <div className="form-inp-prefix">
          <span className="prefix">+91</span>
          <input
            className="form-inp"
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSendOTP(mobile);
            }}
          />
        </div>
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        style={{ marginTop: '8px' }}
        onClick={() => onSendOTP(mobile)}
        disabled={loading}
      >
        {loading ? 'Sending…' : 'Send OTP →'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <span className="auth-link" onClick={onBack}>
          ← Back to login
        </span>
      </div>
    </div>
  );
}
