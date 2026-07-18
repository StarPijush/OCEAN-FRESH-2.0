import { ProductStatus } from '@oceanfresh/shared';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [ProductStatus.DRAFT]: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  [ProductStatus.ACTIVE]: { label: 'Active', className: 'bg-green-100 text-green-700' },
  [ProductStatus.OUT_OF_STOCK]: { label: 'Out of Stock', className: 'bg-orange-100 text-orange-700' },
  [ProductStatus.COMING_SOON]: { label: 'Coming Soon', className: 'bg-blue-100 text-blue-700' },
  [ProductStatus.DISCONTINUED]: { label: 'Discontinued', className: 'bg-purple-100 text-purple-700' },
  [ProductStatus.ARCHIVED]: { label: 'Archived', className: 'bg-red-100 text-red-700' },
  [ProductStatus.HIDDEN]: { label: 'Hidden', className: 'bg-gray-200 text-gray-500' },
  [ProductStatus.PREORDER]: { label: 'Pre-Order', className: 'bg-indigo-100 text-indigo-700' },
};

export function ProductStatusBadge({ status, className = '' }: ProductStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config?.className ?? 'bg-gray-100 text-gray-700'} ${className}`}
    >
      {config?.label ?? status}
    </span>
  );
}
