interface CategorySkeletonProps {
  count?: number;
  variant?: 'card' | 'tree' | 'table';
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-md bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonTreeItem() {
  return (
    <div className="animate-pulse flex items-center gap-2 px-2 py-1.5">
      <div className="h-4 w-4 bg-gray-200 rounded" />
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
      <div className="h-4 w-12 bg-gray-200 rounded-full ml-auto" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-3 border-b border-gray-100">
      <div className="h-10 w-10 rounded-md bg-gray-200" />
      <div className="flex-1 space-y-1">
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/6 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-16 bg-gray-200 rounded-full" />
      <div className="h-4 w-12 bg-gray-200 rounded" />
    </div>
  );
}

export function CategorySkeleton({ count = 5, variant = 'card' }: CategorySkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'tree') {
    return (
      <div className="space-y-0.5">
        {items.map((_, i) => (
          <SkeletonTreeItem key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="border rounded-lg overflow-hidden">
        {items.map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
