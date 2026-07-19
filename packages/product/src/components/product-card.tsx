import type { Product } from '@oceanfresh/shared';

import { ProductPriceDisplay } from './product-price.js';
import { ProductStatusBadge } from './product-status-badge.js';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onSelect, className = '' }: ProductCardProps) {
  return (
    <article
      className={`group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
      role="article"
      aria-label={product.name}
    >
      {onSelect && (
        <button
          onClick={() => onSelect(product)}
          className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
          aria-label={`View ${product.name}`}
        />
      )}

      <div className="aspect-square overflow-hidden rounded-md bg-gray-100 mb-3">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <ProductStatusBadge status={product.status} />
          {product.featured && <span className="text-xs font-medium text-amber-600">Featured</span>}
        </div>

        {product.categoryId && <p className="text-xs text-gray-500">{product.categoryId}</p>}

        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}

        <ProductPriceDisplay product={product} />

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{product.unit ?? 'unit'}</span>
          {product.stock !== undefined && (
            <span className={product.stock <= 0 ? 'text-red-500 font-medium' : ''}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
