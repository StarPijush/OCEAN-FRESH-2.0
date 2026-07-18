interface CartLoadingProps {
  className?: string;
}

export function CartLoading({ className = '' }: CartLoadingProps) {
  return (
    <div className={`animate-pulse ${className}`} aria-label="Loading cart" role="status">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-20 w-20 rounded-md bg-gray-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
