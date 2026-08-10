import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../theme';
import { AppText } from './AppText';

type Tone = 'aqua' | 'gold' | 'green' | 'warn' | 'muted';

const TONE_BG: Record<Tone, string> = {
  aqua: colors.aquaDim,
  gold: colors.goldDim,
  green: colors.greenDim,
  warn: colors.warnDim,
  muted: colors.surface,
};

export interface StatCardData {
  label: string;
  value: string;
  tone: Tone;
}

export function StatCard({ label, value, tone }: StatCardData) {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: TONE_BG[tone] }]} />
      <AppText variant="label" color="mutedBright">
        {label}
      </AppText>
      <AppText style={styles.value}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  value: {
    color: colors.cream,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: typography.display.fontFamily,
  },
  dot: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
