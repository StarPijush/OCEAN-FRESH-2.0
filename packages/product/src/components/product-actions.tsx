import type { Product } from '@oceanfresh/shared';

interface ProductActionsProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onArchive?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  className?: string;
}

export function ProductActions({ product, onEdit, onDelete, onArchive, onDuplicate, className = '' }: ProductActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          aria-label={`Edit ${product.name}`}
        >
          Edit
        </button>
      )}
      {onArchive && (
        <button
          type="button"
          onClick={() => onArchive(product)}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-yellow-700 border border-yellow-300 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
          aria-label={`Archive ${product.name}`}
        >
          Archive
        </button>
      )}
      {onDuplicate && (
        <button
          type="button"
          onClick={() => onDuplicate(product)}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={`Duplicate ${product.name}`}
        >
          Duplicate
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-700 border border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label={`Delete ${product.name}`}
        >
          Delete
        </button>
      )}
    </div>
  );
}
