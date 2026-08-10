import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
}

export function Screen({ title, subtitle, children, scroll = true }: ScreenProps) {
  if (!scroll) {
    return (
      <View style={styles.container}>
        <Header title={title} subtitle={subtitle} />
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Header title={title} subtitle={subtitle} />
      {children}
    </ScrollView>
  );
}

function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title) return null;
  return (
    <View style={styles.header}>
      <AppText variant="display">{title}</AppText>
      {subtitle ? (
        <AppText variant="body" color="mutedBright">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
});
