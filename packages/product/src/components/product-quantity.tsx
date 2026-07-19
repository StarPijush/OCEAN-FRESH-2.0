import { useCallback, useState } from 'react';

interface ProductQuantityProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (quantity: number) => void;
  className?: string;
}

export function ProductQuantity({
  value = 0,
  min = 0,
  max = 999,
  onChange,
  className = '',
}: ProductQuantityProps) {
  const [internalValue, setInternalValue] = useState(value);

  const currentValue = onChange ? value : internalValue;

  const handleChange = useCallback(
    (newValue: number) => {
      const clamped = Math.max(min, Math.min(max, newValue));
      if (onChange) {
        onChange(clamped);
      } else {
        setInternalValue(clamped);
      }
    },
    [min, max, onChange],
  );

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => handleChange(currentValue - 1)}
        disabled={currentValue <= min}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <span className="w-10 text-center text-sm font-medium text-gray-900">{currentValue}</span>

      <button
        type="button"
        onClick={() => handleChange(currentValue + 1)}
        disabled={currentValue >= max}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
