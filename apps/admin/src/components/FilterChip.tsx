import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

export interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Optional count shown in a small bubble. */
  count?: number;
}

/** Consistent selectable chip used for statuses and categories. */
export function FilterChip({ label, active, onPress, count }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={active}
      className="of-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.sm + 2}px ${spacing.md}px`,
        borderRadius: radius.full,
        backgroundColor: active ? colors.aqua : colors.surface,
        border: `1px solid ${active ? colors.aqua : colors.borderStrong}`,
      }}
    >
      <AppText variant="label" color={active ? 'bg' : 'mutedBright'}>
        {label}
      </AppText>
      {count !== undefined && count > 0 ? (
        <span
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            textAlign: 'center',
            lineHeight: '18px',
            padding: '0 4px',
            backgroundColor: active ? 'rgba(10, 22, 40, 0.35)' : colors.aquaDim,
          }}
        >
          <AppText variant="caption" color={active ? 'bg' : 'aqua'} style={{ lineHeight: '18px' }}>
            {count}
          </AppText>
        </span>
      ) : null}
    </button>
  );
}
