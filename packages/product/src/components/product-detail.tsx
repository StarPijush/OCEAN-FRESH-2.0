import type { Product } from '@oceanfresh/shared';
import { ProductPriceDisplay } from './product-price.js';
import { ProductStatusBadge } from './product-status-badge.js';

interface ProductDetailProps {
  product: Product;
  className?: string;
}

export function ProductDetail({ product, className = '' }: ProductDetailProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {product.gallery && product.gallery.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.thumbnail && (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {product.gallery.slice(0, 4).map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-md bg-gray-100">
                <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ProductStatusBadge status={product.status} />
          {product.featured && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2.5 py-0.5">
              Featured
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

        {product.description && (
          <p className="text-gray-600">{product.description}</p>
        )}

        <ProductPriceDisplay product={product} />
      </div>

      {product.description && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        {product.sku && (
          <div>
            <span className="text-gray-500">SKU:</span>{' '}
            <span className="text-gray-900 font-mono">{product.sku}</span>
          </div>
        )}
        {product.barcode && (
          <div>
            <span className="text-gray-500">Barcode:</span>{' '}
            <span className="text-gray-900 font-mono">{product.barcode}</span>
          </div>
        )}
        {product.unit && (
          <div>
            <span className="text-gray-500">Unit:</span>{' '}
            <span className="text-gray-900">{product.unit}</span>
          </div>
        )}
        {product.stock !== undefined && (
          <div>
            <span className="text-gray-500">Stock:</span>{' '}
            <span className={`font-medium ${product.stock <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {product.stock}
            </span>
          </div>
        )}
        {product.minOrderQuantity && (
          <div>
            <span className="text-gray-500">Min Order:</span>{' '}
            <span className="text-gray-900">{product.minOrderQuantity}</span>
          </div>
        )}
        {product.weight && (
          <div>
            <span className="text-gray-500">Weight:</span>{' '}
            <span className="text-gray-900">{product.weight}g</span>
          </div>
        )}
        {product.dimensions && (
          <div className="col-span-2">
            <span className="text-gray-500">Dimensions:</span>{' '}
            <span className="text-gray-900">
              {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit ?? 'cm'}
            </span>
          </div>
        )}
      </div>

      {product.seo && (
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">SEO</h2>
          {product.seo.title && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">Title:</span> {product.seo.title}
            </p>
          )}
          {product.seo.description && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">Description:</span> {product.seo.description}
            </p>
          )}
        </div>
      )}

      {product.variants && product.variants.length > 0 && (
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Variants</h2>
          <div className="space-y-2">
            {product.variants.map((variant, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium text-gray-900">{variant.name}</p>
                  {variant.sku && <p className="text-sm text-gray-500">{variant.sku}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(variant.price)}
                  </p>
                  {variant.stock !== undefined && (
                    <p className="text-sm text-gray-500">{variant.stock} in stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
