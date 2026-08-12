import type { ButtonHTMLAttributes, CSSProperties } from 'react';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  /** RN-compatible handler kept so existing call sites stay unchanged. */
  onPress?: () => void;
  style?: CSSProperties;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isLink = variant === 'link';
  const tone = isLink ? 'aqua' : isPrimary ? 'white' : 'aqua';

  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className="of-btn"
      disabled={disabled ?? loading}
      onClick={onPress ?? rest.onClick}
      style={{
        borderRadius: radius.md,
        padding: isLink ? `${spacing.sm}px 0` : `${spacing.md}px ${spacing.lg}px`,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        width: fullWidth ? '100%' : undefined,
        backgroundColor: isPrimary
          ? colors.aqua
          : variant === 'secondary'
            ? colors.aquaDim
            : variant === 'ghost'
              ? colors.surface
              : variant === 'danger'
                ? colors.warnDim
                : 'transparent',
        border:
          variant === 'link'
            ? 'none'
            : variant === 'primary'
              ? 'none'
              : `1px solid ${colors.borderStrong}`,
        gap: spacing.sm,
        ...style,
      }}
    >
      {loading ? (
        <>
          <Spinner size={16} color={isPrimary ? colors.white : colors.aqua} />
          <AppText variant="label" color={isPrimary ? 'white' : 'aqua'}>
            {label}
          </AppText>
        </>
      ) : (
        <AppText variant="label" color={tone}>
          {label}
        </AppText>
      )}
    </button>
  );
}
