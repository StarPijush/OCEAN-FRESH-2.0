import type { ReactNode } from 'react';

import { useBreakpoint } from '../hooks/use-breakpoint';
import { colors, radius, spacing, STAT_GUTTER, statTileWidth, typography } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Tone = 'aqua' | 'gold' | 'green' | 'warn' | 'muted';

const TONE_META: Record<Tone, { bg: string; fg: string; bar: string }> = {
  aqua: { bg: colors.aquaDim, fg: colors.aqua, bar: colors.aqua },
  gold: { bg: colors.goldDim, fg: colors.gold, bar: colors.gold },
  green: { bg: colors.greenDim, fg: colors.green, bar: colors.green },
  warn: { bg: colors.warnDim, fg: colors.warn, bar: colors.warn },
  muted: { bg: colors.surfaceAlive, fg: colors.mutedBright, bar: colors.borderStrong },
};

export interface StatCardData {
  label: string;
  value: string;
  tone: Tone;
  icon?: IconName;
  /** Short supporting context under the value. */
  hint?: string;
}

/** Tile wrapper (gutter-aware) — reuse for skeletons next to real cards. */
export function StatTile({ width, children }: { width: `${number}%`; children: ReactNode }) {
  return (
    <div style={{ width, padding: `0 ${STAT_GUTTER}px`, marginBottom: STAT_GUTTER * 2 }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, tone, icon, hint }: StatCardData) {
  const meta = TONE_META[tone];
  const { width } = useBreakpoint();

  return (
    <StatTile width={statTileWidth(width)}>
      <div
        className="of-stat-card"
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
          padding: spacing.lg,
          gap: spacing.xs,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: meta.bar,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <AppText variant="label" color="mutedBright" numberOfLines={1}>
            {label}
          </AppText>
          {icon ? <Icon name={icon} size={18} color={meta.fg} /> : null}
        </div>
        <span
          style={{
            color: colors.cream,
            fontSize: 28,
            lineHeight: '34px',
            fontFamily: typography.display.fontFamily,
            fontWeight: typography.display.weight,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </span>
        {hint ? (
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {hint}
          </AppText>
        ) : null}
      </div>
    </StatTile>
  );
}
