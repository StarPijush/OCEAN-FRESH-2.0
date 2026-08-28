import { colors, spacing } from '../../theme';
import { AppText } from '../AppText';
import { Card } from '../Card';
import { EmptyState } from '../StateViews';

interface TopProduct {
  name: string;
  qty: number;
}

interface TopProductsListProps {
  topProducts: TopProduct[];
}

export function TopProductsList({ topProducts }: TopProductsListProps) {
  if (!topProducts.length) {
    return (
      <Card>
        <AppText variant="title">Top Products · This Month</AppText>
        <EmptyState title="No data yet" hint="Sales data will appear once orders arrive." />
      </Card>
    );
  }

  const max = topProducts[0]?.qty ?? 1;

  return (
    <Card>
      <AppText variant="title">Top Products · This Month</AppText>
      <div
        style={{ marginTop: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}
      >
        {topProducts.map((p, i) => {
          return (
            <div
              key={p.name}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.aquaDim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText variant="label" color="aqua">
                  {i + 1}
                </AppText>
              </div>
              <AppText variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                {p.name}
              </AppText>
              <div
                style={{
                  width: 72,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.surfaceAlive,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: colors.aqua,
                    width: `${Math.round((p.qty / max) * 100)}%`,
                  }}
                />
              </div>
              <AppText
                variant="caption"
                color="mutedBright"
                style={{ width: 48, textAlign: 'right' }}
              >
                {p.qty} kg
              </AppText>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
