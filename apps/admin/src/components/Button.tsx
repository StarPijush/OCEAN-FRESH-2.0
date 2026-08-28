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
  const tone = isLink ? 'aqua' : isPrimary ? 'ink' : variant === 'danger' ? 'white' : 'aqua';

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
            ? colors.surface2
            : variant === 'ghost'
              ? 'transparent'
              : variant === 'danger'
                ? colors.warn
                : 'transparent',
        border:
          variant === 'link'
            ? 'none'
            : variant === 'primary'
              ? 'none'
              : variant === 'danger'
                ? 'none'
                : `1px solid ${colors.border}`,
        boxShadow: isPrimary ? '0 0 20px rgba(33,200,200,0.10)' : undefined,
        gap: spacing.sm,
        ...style,
      }}
    >
      {loading ? (
        <>
          <Spinner
            size={16}
            color={isPrimary ? colors.ink : variant === 'danger' ? colors.white : colors.aqua}
          />
          <AppText variant="label" color={tone}>
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
