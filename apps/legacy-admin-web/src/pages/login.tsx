import { useNavigate } from 'react-router-dom';

import { AuthShell } from '../components/auth/AuthShell';

export function LoginPage() {
  const navigate = useNavigate();
  return <AuthShell onLoggedIn={() => navigate('/dashboard', { replace: true })} />;
}
