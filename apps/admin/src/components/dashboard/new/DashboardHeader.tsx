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
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
        paddingBottom: 4,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0B130F',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#6C7E75',
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            border: '1px solid #E9EFEF',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
            transition: 'border-color 150ms var(--ease-out), background 150ms var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            if (!refreshing) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(11,19,15,0.12)';
              (e.currentTarget as HTMLButtonElement).style.background = '#F8FAF9';
            }
          }}
          onMouseLeave={(e) => {
            if (!refreshing) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#E9EFEF';
              (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
            }
          }}
        >
          <span
            style={{
              display: 'flex',
              animation: refreshing ? 'spin 0.8s linear infinite' : undefined,
            }}
          >
            <Icon name="refresh-outline" size={18} color="#6C7E75" />
          </span>
        </button>
      )}
    </div>
  );
}
