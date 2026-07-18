import { CategoryStatus } from '@oceanfresh/shared';

interface CategoryStatusBadgeProps {
  status: CategoryStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [CategoryStatus.ACTIVE]: { label: 'Active', className: 'bg-green-100 text-green-700' },
  [CategoryStatus.DRAFT]: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  [CategoryStatus.HIDDEN]: { label: 'Hidden', className: 'bg-yellow-100 text-yellow-700' },
  [CategoryStatus.ARCHIVED]: { label: 'Archived', className: 'bg-red-100 text-red-700' },
};

export function CategoryStatusBadge({ status, className = '' }: CategoryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config?.className ?? 'bg-gray-100 text-gray-700'} ${className}`}
    >
      {config?.label ?? status}
    </span>
  );
}
