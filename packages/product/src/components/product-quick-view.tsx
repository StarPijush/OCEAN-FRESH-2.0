import type { Product } from '@oceanfresh/shared';

import { ProductPriceDisplay } from './product-price.js';
import { ProductStatusBadge } from './product-status-badge.js';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ProductQuickView({
  product,
  isOpen,
  onClose,
  className = '',
}: ProductQuickViewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4 ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close quick view"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 max-h-48">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ProductStatusBadge status={product.status} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            {product.description && <p className="text-sm text-gray-500">{product.description}</p>}
            <ProductPriceDisplay product={product} />
            {product.stock !== undefined && (
              <p className="text-sm text-gray-500">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
