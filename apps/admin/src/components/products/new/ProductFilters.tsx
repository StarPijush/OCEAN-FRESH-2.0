import { Chip } from '../../ui/new/Chip';
import { Input } from '../../ui/new/Input';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  STATUS_FILTERS: readonly string[];
}

export function ProductFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  STATUS_FILTERS,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: '#FFFFFF',
        border: '1px solid rgba(11,19,15,0.06)',
        borderRadius: 18,
        padding: '18px 20px',
        boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
      }}
    >
      <div style={{ maxWidth: 360 }}>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          leftElement={<span style={{ color: '#6C7E75', fontSize: 14 }}>⌕</span>}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            variant={status === s ? 'active' : 'default'}
            onClick={() => onStatusChange(s)}
          >
            {s.replace('_', ' ')}
          </Chip>
        ))}
      </div>
    </div>
  );
}
