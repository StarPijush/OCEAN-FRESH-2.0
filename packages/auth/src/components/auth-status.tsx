import { useCurrentUser, useAuthState } from '../queries/index.js';
import { UserAvatar } from './user-avatar.js';

interface AuthStatusProps {
  className?: string;
}

export function AuthStatus({ className = '' }: AuthStatusProps) {
  const { data: user } = useCurrentUser();
  const { data: state } = useAuthState();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {user ? (
        <>
          <UserAvatar user={user} size="sm" />
          <span className="text-sm font-medium">{user.displayName}</span>
          <span className="text-xs text-gray-500">{state}</span>
        </>
      ) : (
        <span className="text-sm text-gray-500">Not signed in</span>
      )}
    </div>
  );
}
