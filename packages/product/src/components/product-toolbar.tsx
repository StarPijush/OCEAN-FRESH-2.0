import type { ProductQuery } from '@oceanfresh/shared';

import { ProductFilters } from './product-filters.js';
import { ProductSearch } from './product-search.js';

interface ProductToolbarProps {
  onSearch: (term: string) => void;
  onFilter: (filters: Partial<ProductQuery>) => void;
  categories?: { id: string; name: string }[];
  showFilters?: boolean;
  className?: string;
}

export function ProductToolbar({
  onSearch,
  onFilter,
  categories,
  showFilters = true,
  className = '',
}: ProductToolbarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ProductSearch onSearch={onSearch} />
      {showFilters && <ProductFilters onFilter={onFilter} categories={categories} />}
    </div>
  );
}
