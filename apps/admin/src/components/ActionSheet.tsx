import { Modal, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

/** Bottom-sheet style modal used for add/edit forms and confirms. */
export function ActionSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" color="mutedBright">
            {message}
          </AppText>
          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <Button
              label={confirmLabel}
              variant={danger ? 'danger' : 'primary'}
              loading={loading}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.popover,
  },
  dialog: {
    margin: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { textAlign: 'left' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
