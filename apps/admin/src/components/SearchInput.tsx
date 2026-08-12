import { colors, radius, spacing } from '../theme';
import { Icon } from './Icon';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Search field with a leading magnifier and a clear button. */
export function SearchInput({ value, onChangeText, placeholder, autoFocus }: SearchInputProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderStrong,
        borderRadius: radius.md,
        padding: `0 ${spacing.md}px`,
        minHeight: 46,
      }}
    >
      <Icon name="search" size={18} color={colors.muted} />
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        autoFocus={autoFocus}
        aria-label={placeholder ?? 'Search'}
        style={{
          flex: 1,
          minWidth: 0,
          color: colors.cream,
          padding: `${spacing.md - 2}px 0`,
          fontSize: 16,
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
        }}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChangeText('')}
          aria-label="Clear search"
          style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}
        >
          <Icon name="close-circle" size={18} color={colors.muted} />
        </button>
      ) : null}
    </div>
  );
}
