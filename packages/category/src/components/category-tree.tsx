import type { Category } from '@oceanfresh/shared';

import { CategoryTreeNode } from './category-tree-node.js';

export interface NestedCategoryItem extends Category {
  children: NestedCategoryItem[];
}

interface CategoryTreeProps {
  categories: NestedCategoryItem[];
  onSelect?: (category: Category) => void;
  defaultExpanded?: boolean;
  className?: string;
}

function renderNodes(
  items: NestedCategoryItem[],
  depth: number,
  onSelect?: (category: Category) => void,
  defaultExpanded?: boolean,
) {
  return items.map((item) => (
    <CategoryTreeNode
      key={item.id}
      category={item}
      depth={depth}
      onSelect={onSelect}
      defaultExpanded={defaultExpanded}
    >
      {item.children.length > 0 && renderNodes(item.children, depth + 1, onSelect, defaultExpanded)}
    </CategoryTreeNode>
  ));
}

export function CategoryTree({
  categories,
  onSelect,
  defaultExpanded = false,
  className = '',
}: CategoryTreeProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <p className="text-sm font-medium">No categories found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-0.5 ${className}`} role="tree" aria-label="Category tree">
      {renderNodes(categories, 0, onSelect, defaultExpanded)}
    </div>
  );
}
