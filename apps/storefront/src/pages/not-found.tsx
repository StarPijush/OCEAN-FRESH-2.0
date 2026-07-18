import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '48px 20px' }}>
      <h1 className="empty-title" style={{ fontSize: '3rem' }}>404</h1>
      <p className="empty-sub">Page not found</p>
      <button className="btn btn-dark" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
