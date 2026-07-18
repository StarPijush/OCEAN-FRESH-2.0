import { ProductStatus, ProductSortField } from '@oceanfresh/shared';
import type { ProductQuery } from '@oceanfresh/shared';
import { useState, useCallback } from 'react';

interface ProductFiltersProps {
  onFilter: (filters: Partial<ProductQuery>) => void;
  categories?: { id: string; name: string }[];
  className?: string;
}

export function ProductFilters({ onFilter, categories = [], className = '' }: ProductFiltersProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (key: string, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);

      const query: Partial<ProductQuery> = {};
      if (next.status) query.status = next.status as ProductStatus;
      if (next.categoryId) query.categoryId = next.categoryId;
      if (next.sort) query.sort = next.sort as ProductSortField;
      if (next.featured === 'true') query.featured = true;
      if (next.priceMin) query.priceMin = Number(next.priceMin);
      if (next.priceMax) query.priceMax = Number(next.priceMax);
      onFilter(query);
    },
    [filters, onFilter],
  );

  const handleClear = useCallback(() => {
    setFilters({});
    onFilter({});
  }, [onFilter]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-green-600 hover:text-green-700"
        >
          Clear all
        </button>
      </div>

      {categories.length > 0 && (
        <div>
          <label htmlFor="filter-category" className="block text-xs font-medium text-gray-500 mb-1">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.categoryId ?? ''}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="filter-status" className="block text-xs font-medium text-gray-500 mb-1">
          Status
        </label>
        <select
          id="filter-status"
          value={filters.status ?? ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          {Object.values(ProductStatus).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-sort" className="block text-xs font-medium text-gray-500 mb-1">
          Sort By
        </label>
        <select
          id="filter-sort"
          value={filters.sort ?? ''}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">Default</option>
          <option value={ProductSortField.NAME}>Name</option>
          <option value={ProductSortField.PRICE}>Price</option>
          <option value={ProductSortField.CREATED_AT}>Newest</option>
          <option value={ProductSortField.STOCK}>Stock</option>
          <option value={ProductSortField.DISPLAY_ORDER}>Sort Order</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="filter-featured"
          type="checkbox"
          checked={filters.featured === 'true'}
          onChange={(e) => handleChange('featured', e.target.checked ? 'true' : '')}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="filter-featured" className="text-xs font-medium text-gray-500">
          Featured only
        </label>
      </div>

      <div>
        <label htmlFor="filter-price-min" className="block text-xs font-medium text-gray-500 mb-1">
          Min Price
        </label>
        <input
          id="filter-price-min"
          type="number"
          min={0}
          value={filters.priceMin ?? ''}
          onChange={(e) => handleChange('priceMin', e.target.value)}
          placeholder="0"
          className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="filter-price-max" className="block text-xs font-medium text-gray-500 mb-1">
          Max Price
        </label>
        <input
          id="filter-price-max"
          type="number"
          min={0}
          value={filters.priceMax ?? ''}
          onChange={(e) => handleChange('priceMax', e.target.value)}
          placeholder="99999"
          className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
