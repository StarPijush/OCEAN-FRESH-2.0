import type { Product } from '@oceanfresh/shared';

import { ProductActions } from './product-actions.js';
import { ProductPriceDisplay } from './product-price.js';
import { ProductStatusBadge } from './product-status-badge.js';

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onArchive?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  className?: string;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  selectedIds,
  onSelect,
  className = '',
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onSelect && (
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
              >
                <input
                  type="checkbox"
                  onChange={() => {
                    products.forEach((p) => onSelect(p.id));
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </th>
            )}
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Stock
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
            {(onEdit || onDelete || onArchive || onDuplicate) && (
              <th
                scope="col"
                className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              {onSelect && (
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(product.id) ?? false}
                    onChange={() => onSelect(product.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </td>
              )}
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
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
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    {product.sku && <p className="text-xs text-gray-500">{product.sku}</p>}
                  </div>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <ProductStatusBadge status={product.status} />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <ProductPriceDisplay product={product} />
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.stock ?? 0}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.categoryId ?? '-'}
              </td>
              {(onEdit || onDelete || onArchive || onDuplicate) && (
                <td className="px-3 py-4 whitespace-nowrap text-right">
                  <ProductActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onDuplicate={onDuplicate}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
