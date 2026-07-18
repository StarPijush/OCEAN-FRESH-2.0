import { useCallback } from 'react';
import type { CreateProductInput, UpdateProductInput, Product } from '@oceanfresh/shared';
import { ProductStatus } from '@oceanfresh/shared';

interface ProductFormProps {
  mode: 'create' | 'update';
  initialData?: Partial<Product>;
  onSubmit: (data: CreateProductInput | UpdateProductInput) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ProductForm({ mode, initialData, onSubmit, isSubmitting, className = '' }: ProductFormProps) {
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      if (mode === 'create') {
        onSubmit(data as unknown as CreateProductInput);
      } else {
        onSubmit(data as unknown as UpdateProductInput);
      }
    },
    [mode, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData?.name ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            type="text"
            defaultValue={initialData?.sku ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            type="text"
            defaultValue={initialData?.description ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initialData?.description ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (INR) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={0}
            step={0.01}
            defaultValue={initialData?.price ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
            Compare At Price
          </label>
          <input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            min={0}
            step={0.01}
            defaultValue={initialData?.compareAtPrice ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={initialData?.stock ?? 0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <input
            id="unit"
            name="unit"
            type="text"
            placeholder="kg, piece, bunch, etc."
            defaultValue={initialData?.unit ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            id="categoryId"
            name="categoryId"
            type="text"
            defaultValue={initialData?.categoryId ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? ProductStatus.DRAFT}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {Object.values(ProductStatus).map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={initialData?.featured ?? false}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Featured Product
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}
