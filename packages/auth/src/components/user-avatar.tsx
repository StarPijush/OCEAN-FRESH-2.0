import type { UserIdentity } from '@oceanfresh/shared';

interface UserAvatarProps {
  user: Pick<UserIdentity, 'displayName' | 'photoURL'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClass = sizeMap[size];

  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={`${sizeClass} rounded-full bg-blue-500 flex items-center justify-center text-white font-medium ${className}`}
    >
      {initials}
    </div>
  );
}
