import { useEffect, useRef, useState } from 'react';

interface Props {
  onReset: (p1: string, p2: string) => Promise<boolean>;
  onBack: () => void;
  error: string;
}

export function ResetScreen({ onReset, onBack, error }: Props) {
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    await onReset(pass1, pass2);
    setLoading(false);
  };

  return (
    <div className="auth-screen auth-card">
      <div className="auth-logo">
        Ocean<span>Fresh</span>
      </div>
      <div className="auth-eyebrow">Set New Password</div>
      <h2 className="auth-title">New password</h2>
      <p className="auth-sub">Choose a strong password. Minimum 6 characters.</p>

      <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>

      <div className="form-grp">
        <label className="form-lbl">New Password</label>
        <div className="form-inp-password">
          <input
            className="form-inp"
            type={show1 ? 'text' : 'password'}
            placeholder="New password"
            value={pass1}
            onChange={(e) => setPass1(e.target.value)}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <button
            type="button"
            className="btn-eye"
            onClick={() => setShow1((p) => !p)}
            tabIndex={-1}
          >
            {show1 ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div className="form-grp">
        <label className="form-lbl">Confirm Password</label>
        <div className="form-inp-password">
          <input
            className="form-inp"
            type={show2 ? 'text' : 'password'}
            placeholder="Confirm password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <button
            type="button"
            className="btn-eye"
            onClick={() => setShow2((p) => !p)}
            tabIndex={-1}
          >
            {show2 ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        style={{ marginTop: '8px' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Updating…' : 'Update Password →'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <span className="auth-link" onClick={onBack}>
          ← Back to login
        </span>
      </div>
    </div>
  );
}
