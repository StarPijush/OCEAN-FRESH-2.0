import type { Product } from '@oceanfresh/shared';

interface ProductPriceProps {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  className?: string;
}

export function ProductPrice({ price, compareAtPrice, currency = 'INR', className = '' }: ProductPriceProps) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-lg font-bold text-green-700">{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-sm text-gray-400 line-through">{formatPrice(compareAtPrice)}</span>
      )}
    </div>
  );
}

export function ProductPriceDisplay({ product }: { product: Product }) {
  return (
    <ProductPrice
      price={product.price}
      compareAtPrice={product.compareAtPrice}
    />
  );
}
