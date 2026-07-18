import type { ReactNode } from 'react';

interface OrderEmptyProps {
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function OrderEmpty({
  message = 'No orders found',
  action,
  className = '',
}: OrderEmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`} role="status">
      <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="mt-4 text-sm font-medium text-gray-900">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
