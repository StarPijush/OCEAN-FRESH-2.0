import { useState, useRef, useEffect } from 'react';

interface Props {
  onLogin: (mobile: string, password: string) => Promise<boolean>;
  onForgot: () => void;
  error: string;
  loading: boolean;
}

export function LoginScreen({ onLogin, onForgot, error, loading }: Props) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const mobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { mobileRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!mobile || !password) return;
    await onLogin(mobile, password);
  };

  return (
    <div className="auth-screen auth-card">
      <div className="auth-logo">Ocean<span>Fresh</span></div>
      <div className="auth-eyebrow">Admin Panel · Secure Login</div>
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-sub">Sign in with your registered mobile number and password.</p>

      <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>

      <div className="form-grp">
        <label className="form-lbl">Mobile Number</label>
        <div className="form-inp-prefix">
          <span className="prefix">+91</span>
          <input
            id="login-mobile"
            className="form-inp"
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            ref={mobileRef}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          />
        </div>
      </div>

      <div className="form-grp">
        <label className="form-lbl">Password</label>
        <div className="form-inp-password">
          <input
            id="login-password"
            className="form-inp"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          />
          <button
            type="button"
            className="btn-eye"
            onClick={() => setShowPass(p => !p)}
            tabIndex={-1}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        style={{ marginTop: '8px' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Signing In…' : 'Sign In →'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <span className="auth-link" onClick={onForgot}>Forgot password?</span>
      </div>
    </div>
  );
}
