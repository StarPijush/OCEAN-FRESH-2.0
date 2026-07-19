import type { Category } from '@oceanfresh/shared';

import { CategoryStatusBadge } from './category-status-badge.js';

interface CategoryTableProps {
  categories: Category[];
  onSelect?: (category: Category) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  className?: string;
}

export function CategoryTable({
  categories,
  onSelect,
  selectedIds,
  onToggleSelect,
  className = '',
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg font-medium">No categories found</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onToggleSelect && (
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
              >
                <input
                  type="checkbox"
                  onChange={() => categories.forEach((c) => onToggleSelect(c.id))}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </th>
            )}
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Products
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Level
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Slug
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr
              key={category.id}
              className={`hover:bg-gray-50 ${onSelect ? 'cursor-pointer' : ''}`}
              onClick={() => onSelect?.(category)}
            >
              {onToggleSelect && (
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(category.id) ?? false}
                    onChange={() => onToggleSelect(category.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </td>
              )}
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {category.thumbnail ? (
                      <img src={category.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <CategoryStatusBadge status={category.status} />
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {category.productCount}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {category.level}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {category.slug}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
