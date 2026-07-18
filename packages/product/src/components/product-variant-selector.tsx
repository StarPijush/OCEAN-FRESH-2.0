import type { ProductVariant } from '@oceanfresh/shared';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onSelect: (variant: ProductVariant) => void;
  className?: string;
}

export function ProductVariantSelector({ variants, selectedVariantId, onSelect, className = '' }: ProductVariantSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Variants</label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              disabled={variant.stock !== undefined && variant.stock <= 0}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {variant.name}
              {variant.stock !== undefined && (
                <span className="ml-1 text-xs text-gray-400">({variant.stock})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
