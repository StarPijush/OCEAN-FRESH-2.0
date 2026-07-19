import type { Category } from '@oceanfresh/shared';

interface CategoryBreadcrumbProps {
  ancestors: Category[];
  current?: Category;
  onSelect?: (category: Category) => void;
  className?: string;
}

export function CategoryBreadcrumb({
  ancestors,
  current,
  onSelect,
  className = '',
}: CategoryBreadcrumbProps) {
  if (ancestors.length === 0 && !current) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
        {onSelect && (
          <li>
            <button
              type="button"
              onClick={() => onSelect({ id: '' } as Category)}
              className="hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </button>
          </li>
        )}
        {ancestors.map((ancestor) => (
          <li key={ancestor.id} className="flex items-center gap-1.5">
            <span className="text-gray-300">/</span>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(ancestor)}
                className="hover:text-gray-700 focus:outline-none"
              >
                {ancestor.name}
              </button>
            ) : (
              <span>{ancestor.name}</span>
            )}
          </li>
        ))}
        {current && (
          <li className="flex items-center gap-1.5">
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{current.name}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
