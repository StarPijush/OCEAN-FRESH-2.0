import { useMemo } from 'react';
import type { Category } from '@oceanfresh/shared';

interface CategorySelectorProps {
  categories: Category[];
  value?: string;
  onChange?: (categoryId: string | null) => void;
  includeRoot?: boolean;
  excludeId?: string;
  className?: string;
  placeholder?: string;
}

function buildOptions(
  categories: Category[],
  parentId: string | null,
  depth: number,
  excludeId?: string,
): { value: string; label: string; depth: number }[] {
  const result: { value: string; label: string; depth: number }[] = [];

  for (const cat of categories) {
    if (cat.id === excludeId) continue;
    if (cat.parentId === parentId && !cat.isDeleted) {
      result.push({ value: cat.id, label: cat.name, depth });
      result.push(...buildOptions(categories, cat.id, depth + 1, excludeId));
    }
  }

  return result;
}

export function CategorySelector({ categories, value, onChange, includeRoot = true, excludeId, className = '', placeholder = 'Select a category' }: CategorySelectorProps) {
  const options = useMemo(
    () => buildOptions(categories, null, 0, excludeId),
    [categories, excludeId],
  );

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${className}`}
      aria-label={placeholder}
    >
      {includeRoot && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {'\u00A0'.repeat(opt.depth * 3)}{opt.depth > 0 ? '\u2514\u00A0' : ''}{opt.label}
        </option>
      ))}
    </select>
  );
}
