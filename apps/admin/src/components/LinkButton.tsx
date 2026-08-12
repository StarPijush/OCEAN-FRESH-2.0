import type { ButtonHTMLAttributes, CSSProperties } from 'react';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Spinner } from './Spinner';

interface LinkButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  label: string;
  variant?: 'aqua' | 'muted';
  loading?: boolean;
  /** RN-compatible handler kept so existing call sites stay unchanged. */
  onPress?: () => void;
  style?: CSSProperties;
}

export function LinkButton({
  label,
  variant = 'aqua',
  loading = false,
  onPress,
  style,
  ...rest
}: LinkButtonProps) {
  const color = variant === 'aqua' ? colors.aqua : colors.mutedBright;
  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className="of-btn"
      disabled={rest.disabled ?? loading}
      onClick={onPress ?? rest.onClick}
      style={{
        padding: `${spacing.sm}px`,
        backgroundColor: 'transparent',
        border: 'none',
        color,
        ...style,
      }}
    >
      {loading ? (
        <Spinner size={14} color={color} />
      ) : (
        <AppText variant="label" color={variant}>
          {label}
        </AppText>
      )}
    </button>
  );
}
