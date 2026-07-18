import { useState, type FormEvent } from 'react';
import type { RegisterInput } from '@oceanfresh/shared';
import { PasswordStrength } from './password-strength.js';

interface RegisterFormProps {
  onSubmit: (data: RegisterInput) => void;
  isSubmitting?: boolean;
  error?: string | null;
  className?: string;
}

export function RegisterForm({ onSubmit, isSubmitting = false, error = null, className = '' }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, displayName, phone: phone || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone (optional)
        </label>
        <input
          id="reg-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="[0-9]{10}"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <PasswordStrength password={password} />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
