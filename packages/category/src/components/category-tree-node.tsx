import type { Category } from '@oceanfresh/shared';
import React, { useState } from 'react';

import { CategoryStatusBadge } from './category-status-badge.js';

interface CategoryTreeNodeProps {
  category: Category;
  children?: React.ReactNode;
  depth?: number;
  onSelect?: (category: Category) => void;
  defaultExpanded?: boolean;
  className?: string;
}

export function CategoryTreeNode({
  category,
  children,
  depth = 0,
  onSelect,
  defaultExpanded = false,
  className = '',
}: CategoryTreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = children && React.Children.count(children) > 0;

  return (
    <div className={className}>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer ${
          depth > 0 ? 'ml-6' : ''
        }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={category.name}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <div className="w-4 flex-shrink-0" />}

        <span
          className="flex-1 text-sm text-gray-900 truncate"
          onClick={() => onSelect?.(category)}
        >
          {category.name}
        </span>

        <CategoryStatusBadge status={category.status} />
        {category.featured && <span className="text-xs text-amber-600 font-medium">Featured</span>}
        <span className="text-xs text-gray-400">{category.productCount}</span>
      </div>

      {hasChildren && expanded && <div role="group">{children}</div>}
    </div>
  );
}
