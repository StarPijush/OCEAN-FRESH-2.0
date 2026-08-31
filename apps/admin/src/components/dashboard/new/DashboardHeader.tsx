import { Icon } from '../../Icon';

interface Props {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function DashboardHeader({ title, subtitle, onRefresh, refreshing }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 300,
            color: 'var(--color-cream)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted2)', marginTop: 4 }}>{subtitle}</div>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid var(--color-border2)',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              display: 'flex',
              animation: refreshing ? 'spin 0.8s linear infinite' : undefined,
            }}
          >
            <Icon name="refresh-outline" size={16} color="var(--color-muted2)" />
          </span>
        </button>
      )}
    </div>
  );
}
