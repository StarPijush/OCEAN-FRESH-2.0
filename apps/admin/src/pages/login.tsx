import { AuthShell } from '../components/auth/AuthShell';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  return <AuthShell onLoggedIn={() => navigate('/dashboard', { replace: true })} />;
}
