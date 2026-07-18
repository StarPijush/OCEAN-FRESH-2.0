interface OrderLoadingProps {
  className?: string;
}

export function OrderLoading({ className = '' }: OrderLoadingProps) {
  return (
    <div className={`animate-pulse ${className}`} aria-label="Loading orders" role="status">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-5 w-24 rounded-full bg-gray-200" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-48 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
              <div className="h-3 w-20 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
