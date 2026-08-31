import type { Category } from '@oceanfresh/shared';

import { Chip } from '../../ui/new/Chip';
import { Input } from '../../ui/new/Input';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  categoryId: string;
  onCategoryChange: (v: string) => void;
  categories: Category[];
  STATUS_FILTERS: readonly string[];
}

export function ProductFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  categories,
  STATUS_FILTERS,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ maxWidth: 360 }}>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products…"
          leftElement={<span>🔍</span>}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            variant={status === s ? 'active' : 'default'}
            onClick={() => onStatusChange(s)}
          >
            {s}
          </Chip>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip
          variant={categoryId === 'all' ? 'active' : 'default'}
          onClick={() => onCategoryChange('all')}
        >
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            variant={categoryId === c.id ? 'active' : 'default'}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.name}
          </Chip>
        ))}
      </div>
    </div>
  );
}
