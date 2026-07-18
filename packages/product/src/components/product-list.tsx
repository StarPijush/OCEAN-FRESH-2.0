import type { Product } from '@oceanfresh/shared';
import { ProductStatusBadge } from './product-status-badge.js';
import { ProductPriceDisplay } from './product-price.js';

interface ProductListProps {
  products: Product[];
  onSelect?: (product: Product) => void;
  className?: string;
}

export function ProductList({ products, onSelect, className = '' }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-gray-200 border rounded-lg ${className}`}>
      {products.map((product) => (
        <div
          key={product.id}
          className={`flex items-center gap-4 p-4 ${onSelect ? 'cursor-pointer hover:bg-gray-50' : ''}`}
          role={onSelect ? 'button' : undefined}
          onClick={() => onSelect?.(product)}
        >
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
              <ProductStatusBadge status={product.status} />
            </div>
            {product.description && (
              <p className="text-sm text-gray-500 truncate">{product.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              {product.sku && <span>SKU: {product.sku}</span>}
              {product.categoryId && <span>Cat: {product.categoryId}</span>}
              <span>Stock: {product.stock ?? 0}</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <ProductPriceDisplay product={product} />
          </div>
        </div>
      ))}
    </div>
  );
}
