import { spacing } from '../../theme';
import { FilterChip } from '../FilterChip';
import { SearchInput } from '../SearchInput';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: { id: string; name: string }[];
  isDesktop: boolean;
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
  isDesktop,
  STATUS_FILTERS,
}: ProductFiltersProps) {
  const categoryChips = (
    <>
      <FilterChip
        label="All"
        active={categoryId === 'all'}
        onPress={() => onCategoryChange('all')}
      />
      {categories.map((c) => (
        <FilterChip
          key={c.id}
          label={c.name}
          active={categoryId === c.id}
          onPress={() => onCategoryChange(c.id === categoryId ? 'all' : c.id)}
        />
      ))}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md }}>
        <div style={{ flex: 1 }}>
          <SearchInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search products…"
          />
        </div>
      </div>
      {categories.length > 0 ? (
        isDesktop ? (
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {categoryChips}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: spacing.sm,
              overflowX: 'auto',
              paddingRight: spacing.sm,
              paddingBottom: 2,
            }}
          >
            {categoryChips}
          </div>
        )
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {STATUS_FILTERS.map((s) => (
          <FilterChip key={s} label={s} active={status === s} onPress={() => onStatusChange(s)} />
        ))}
      </div>
    </div>
  );
}
