interface ProductStockIndicatorProps {
  stock: number;
  lowThreshold?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProductStockIndicator({ stock, lowThreshold = 10, showLabel = true, className = '' }: ProductStockIndicatorProps) {
  let color: string;
  let label: string;

  if (stock <= 0) {
    color = 'bg-red-500';
    label = 'Out of stock';
  } else if (stock <= lowThreshold) {
    color = 'bg-yellow-500';
    label = `Low stock (${stock} left)`;
  } else {
    color = 'bg-green-500';
    label = 'In stock';
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-4 rounded-sm ${
              stock > 0 && stock / (lowThreshold * 3) > i / 4 ? color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500">{label}</span>
      )}
    </div>
  );
}
