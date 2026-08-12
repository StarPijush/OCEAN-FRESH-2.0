import { type ChangeEventHandler, type CSSProperties, type Ref, useId } from 'react';

import { colors, spacing, typography } from '../theme';
import { AppText } from './AppText';

type RNTKeyboard = 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad';

export interface TextFieldProps {
  label?: string;
  error?: string | null;
  hint?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: RNTKeyboard;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  /** Mirrors the RN `editable` prop; disables editing when false. */
  editable?: boolean;
  textContentType?: string;
  maxLength?: number;
  id?: string;
  name?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

function inputModeFor(keyboardType?: RNTKeyboard): 'numeric' | 'email' | 'tel' | undefined {
  switch (keyboardType) {
    case 'numeric':
    case 'number-pad':
      return 'numeric';
    case 'email-address':
      return 'email';
    case 'phone-pad':
      return 'tel';
    default:
      return undefined;
  }
}

function autoCompleteFor(textContentType?: string): string | undefined {
  switch (textContentType) {
    case 'username':
      return 'username';
    case 'password':
      return 'current-password';
    case 'newPassword':
      return 'new-password';
    default:
      return undefined;
  }
}

export function TextField({
  label,
  error,
  hint,
  onChangeText,
  onChange,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  editable = true,
  textContentType,
  style,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        marginBottom: spacing.lg,
      }}
    >
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            marginLeft: spacing.xs,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            fontSize: typography.label.size,
            lineHeight: `${typography.label.lineHeight}px`,
            fontWeight: typography.label.weight,
            fontFamily: typography.label.fontFamily,
            color: colors.mutedBright,
          }}
        >
          {label}
        </label>
      ) : null}
      <input
        {...rest}
        id={inputId}
        type={secureTextEntry ? 'password' : 'text'}
        inputMode={inputModeFor(keyboardType)}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect === false ? 'off' : undefined}
        autoComplete={autoCompleteFor(textContentType)}
        disabled={!editable}
        onChange={onChangeText ? (e) => onChangeText(e.target.value) : onChange}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: error ? colors.warn : colors.borderStrong,
          borderRadius: 12,
          padding: `${spacing.md}px ${spacing.lg}px`,
          color: colors.cream,
          fontSize: typography.body.size,
          fontFamily: typography.body.fontFamily,
          caretColor: colors.aqua,
          ...style,
        }}
      />
      {error ? (
        <AppText variant="caption" color="warn" style={{ marginLeft: spacing.xs }}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="muted" style={{ marginLeft: spacing.xs }}>
          {hint}
        </AppText>
      ) : null}
    </div>
  );
}
