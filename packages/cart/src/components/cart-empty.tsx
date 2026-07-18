import type { ReactNode } from 'react';

interface CartEmptyProps {
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function CartEmpty({
  message = 'Your cart is empty',
  action,
  className = '',
}: CartEmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`} role="status">
      <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <p className="mt-4 text-sm font-medium text-gray-900">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
