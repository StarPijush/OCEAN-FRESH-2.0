import type { Category } from '@oceanfresh/shared';

import { CategoryStatusBadge } from './category-status-badge.js';

interface CategoryCardProps {
  category: Category;
  onSelect?: (category: Category) => void;
  className?: string;
}

export function CategoryCard({ category, onSelect, className = '' }: CategoryCardProps) {
  return (
    <article
      className={`group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
      role="article"
      aria-label={category.name}
    >
      {onSelect && (
        <button
          onClick={() => onSelect(category)}
          className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
          aria-label={`View ${category.name}`}
        />
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          {category.thumbnail ? (
            <img
              src={category.thumbnail}
              alt={category.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-500 truncate">{category.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <CategoryStatusBadge status={category.status} />
        <div className="flex items-center gap-2 text-gray-400">
          <span>{category.productCount} products</span>
          {category.featured && <span className="text-amber-600 font-medium">Featured</span>}
        </div>
      </div>

      {category.level !== undefined && category.level > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          Level {category.level} &middot; {category.path}
        </div>
      )}
    </article>
  );
}
