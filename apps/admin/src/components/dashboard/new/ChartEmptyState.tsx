import { Icon } from '../../../components/Icon';

interface Props {
  range: 'week' | 'month';
}

export function ChartEmptyState({ range }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--color-muted)',
        minHeight: 200,
      }}
    >
      <div style={{ marginBottom: 16, opacity: 0.5 }}>
        <Icon name="trending-up-outline" size={48} color="var(--color-border)" />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px 0',
        }}
      >
        No performance data yet
      </h3>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, maxWidth: '280px' }}>
        {range === 'week'
          ? 'No orders recorded in the last 7 days.'
          : 'No orders recorded in the last 4 weeks.'}
      </p>
    </div>
  );
}
