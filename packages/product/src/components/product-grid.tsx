import type { Product } from '@oceanfresh/shared';
import { ProductCard } from './product-card.js';

interface ProductGridProps {
  products: Product[];
  onSelect?: (product: Product) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridCols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

export function ProductGrid({ products, onSelect, columns = 4, className = '' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelect} />
      ))}
    </div>
  );
}
