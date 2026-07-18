interface CheckoutButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  itemCount?: number;
  className?: string;
}

export function CheckoutButton({
  onClick,
  disabled = false,
  loading = false,
  itemCount = 0,
  className = '',
}: CheckoutButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading || itemCount === 0}
      className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors
        ${disabled || itemCount === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'}
        ${loading ? 'opacity-70 cursor-wait' : ''}
        ${className}`}
      aria-label={`Checkout with ${itemCount} items`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </span>
      ) : (
        `Checkout${itemCount > 0 ? ` (${itemCount})` : ''}`
      )}
    </button>
  );
}
