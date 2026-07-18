interface ProductSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="aspect-square rounded-md bg-gray-200 mb-3" />
      <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-full bg-gray-200 rounded mb-1" />
      <div className="h-5 w-24 bg-gray-200 rounded mt-3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, layout = 'grid' }: ProductSkeletonProps) {
  return (
    <div
      className={
        layout === 'grid'
          ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
          : 'space-y-4'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
