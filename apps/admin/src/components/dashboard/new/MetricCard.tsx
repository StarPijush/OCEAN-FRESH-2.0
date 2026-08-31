import { Icon, type IconName } from '../../Icon';

type Tone = 'aqua' | 'gold' | 'green' | 'warn' | 'muted';

export interface MetricCardProps {
  label: string;
  value: string;
  tone: Tone;
  icon?: IconName;
  hint?: string;
}

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  aqua: { bg: 'rgba(74,184,193,0.15)', fg: 'var(--color-aqua)' },
  gold: { bg: 'rgba(240,180,41,0.15)', fg: 'var(--color-gold)' },
  green: { bg: 'rgba(74,222,128,0.15)', fg: 'var(--color-green)' },
  warn: { bg: 'rgba(224,122,101,0.15)', fg: 'var(--color-warn)' },
  muted: { bg: 'rgba(255,255,255,0.06)', fg: 'var(--color-muted2)' },
};

export function MetricCard({ label, value, tone, icon, hint }: MetricCardProps) {
  const meta = TONE_STYLES[tone];
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 112,
        justifyContent: 'space-between',
        transition: 'border-color 150ms var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            lineHeight: '14px',
            flex: 1,
          }}
        >
          {label}
        </span>
        {icon ? (
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: meta.bg,
              border: `1px solid ${meta.bg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={icon} size={18} color={meta.fg} />
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            color: 'var(--color-cream)',
            fontSize: 28,
            lineHeight: 1.1,
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </span>
        {hint ? <span style={{ fontSize: 11, color: 'var(--color-muted2)' }}>{hint}</span> : null}
      </div>
    </div>
  );
}
