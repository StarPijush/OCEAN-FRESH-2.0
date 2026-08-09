import { useEffect, useRef, useState } from 'react';

interface Props {
  onSendResetEmail: (email: string) => Promise<boolean>;
  onBack: () => void;
  error: string;
  loading: boolean;
}

export function ForgotScreen({ onSendResetEmail, onBack, error, loading }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!email.trim()) return;
    const ok = await onSendResetEmail(email.trim());
    if (ok) setSent(true);
  };

  return (
    <div className="auth-screen auth-card">
      <div className="auth-logo">
        Ocean<span>Fresh</span>
      </div>
      <div className="auth-eyebrow">Password Recovery</div>
      <h2 className="auth-title">Reset password</h2>
      <p className="auth-sub">
        Enter your registered email address and we will send you a reset link.
      </p>

      <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>

      {sent ? (
        <div className="auth-success show">
          Check your inbox. Follow the link in the email to set a new password.
        </div>
      ) : (
        <>
          <div className="form-grp">
            <label className="form-lbl">Registered Email</label>
            <input
              id="forgot-email"
              className="form-inp"
              type="email"
              placeholder="admin@freshcatch.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '8px' }}
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send Reset Link →'}
          </button>
        </>
      )}

      <div style={{ textAlign: 'center' }}>
        <span className="auth-link" onClick={onBack}>
          ← Back to login
        </span>
      </div>
    </div>
  );
}
