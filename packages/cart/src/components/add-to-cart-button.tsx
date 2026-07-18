import type { ReactNode } from 'react';

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  quantity?: number;
  className?: string;
  children?: ReactNode;
}

export function AddToCartButton({
  onClick,
  disabled = false,
  loading = false,
  className = '',
  children,
}: AddToCartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors
        ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'}
        ${loading ? 'opacity-70 cursor-wait' : ''}
        ${className}`}
      aria-label={typeof children === 'string' ? children : 'Add to cart'}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      )}
      {children ?? 'Add to Cart'}
    </button>
  );
}
