import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="auth-shell">
      <div className="auth-bg" />
      <div className="auth-grid" />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">
          Ocean<span>Fresh</span>
        </div>
        <div className="auth-eyebrow">Page Not Found</div>
        <h2 className="auth-title" style={{ fontSize: '3rem', marginBottom: '4px' }}>
          404
        </h2>
        <p className="auth-sub">The page you&apos;re looking for doesn&apos;t exist.</p>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
