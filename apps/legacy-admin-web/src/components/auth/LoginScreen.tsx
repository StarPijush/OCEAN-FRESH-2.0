import { useEffect, useRef, useState } from 'react';

interface Props {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onForgot: () => void;
  error: string;
  loading: boolean;
}

export function LoginScreen({ onLogin, onForgot, error, loading }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    await onLogin(email.trim(), password);
  };

  return (
    <div className="auth-screen auth-card">
      <div className="auth-logo">
        Ocean<span>Fresh</span>
      </div>
      <div className="auth-eyebrow">Admin Panel · Secure Login</div>
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-sub">Sign in with your registered email and password.</p>

      <div className={`auth-error ${error ? 'show' : ''}`}>{error}</div>

      <div className="form-grp">
        <label className="form-lbl">Email Address</label>
        <input
          id="login-email"
          className="form-inp"
          type="email"
          placeholder="admin@freshcatch.com"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          ref={emailRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
      </div>

      <div className="form-grp">
        <label className="form-lbl">Password</label>
        <div className="form-inp-password">
          <input
            id="login-password"
            className="form-inp"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <button
            type="button"
            className="btn-eye"
            onClick={() => setShowPass((p) => !p)}
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
        <span className="auth-link" onClick={onForgot}>
          Forgot password?
        </span>
      </div>
    </div>
  );
}
