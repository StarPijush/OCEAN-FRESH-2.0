import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

type StrengthLevel = { label: string; color: string; width: string; score: number };

function calculateStrength(password: string): StrengthLevel {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5', score };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/5', score };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/5', score };
  if (score <= 4) return { label: 'Strong', color: 'bg-lime-500', width: 'w-4/5', score };
  return { label: 'Very Strong', color: 'bg-green-500', width: 'w-full', score };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
      </div>
      <p className="text-xs text-gray-500 mt-1">Password strength: {strength.label}</p>
    </div>
  );
}
