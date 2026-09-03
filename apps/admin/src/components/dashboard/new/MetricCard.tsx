import { Icon, type IconName } from '../../Icon';

type Tone = 'aqua' | 'green' | 'warn' | 'muted';

export interface MetricCardProps {
  label: string;
  value: string;
  tone: Tone;
  icon?: IconName;
  hint?: string;
  isLead?: boolean;
}

const TONE_STYLES: Record<Tone, { fg: string; bg: string; border: string }> = {
  aqua: { fg: '#0d2035', bg: 'rgba(74,184,193,0.10)', border: 'rgba(74,184,193,0.18)' },
  green: { fg: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.14)' },
  warn: { fg: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.14)' },
  muted: { fg: '#6C7E75', bg: '#F8FAF9', border: 'rgba(11,19,15,0.06)' },
};

export function MetricCard({ label, value, tone, icon, hint, isLead = false }: MetricCardProps) {
  const meta = TONE_STYLES[tone];
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(11,19,15,0.06)',
        borderRadius: isLead ? 24 : 18,
        padding: isLead ? 'clamp(20px, 4vw, 1.75rem)' : '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: isLead ? 14 : 10,
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
        boxShadow: isLead ? '0 20px 50px rgba(11,19,15,0.06)' : '0 10px 30px rgba(11,19,15,0.04)',
        transition:
          'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out), transform 150ms var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'rgba(11,19,15,0.08)';
        el.style.boxShadow = isLead
          ? '0 25px 60px rgba(11,19,15,0.08)'
          : '0 20px 50px rgba(11,19,15,0.08)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'rgba(11,19,15,0.06)';
        el.style.boxShadow = isLead
          ? '0 20px 50px rgba(11,19,15,0.06)'
          : '0 10px 30px rgba(11,19,15,0.04)';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: isLead ? 11 : 10,
            fontWeight: 600,
            letterSpacing: isLead ? '0.18em' : '0.2em',
            textTransform: 'uppercase',
            color: '#6C7E75',
            lineHeight: 1.4,
            flex: 1,
            minWidth: 0,
          }}
        >
          {label}
        </span>
        {icon ? (
          <span
            style={{
              width: isLead ? 40 : 32,
              height: isLead ? 40 : 32,
              borderRadius: isLead ? 14 : 10,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={icon} size={isLead ? 20 : 16} color={meta.fg} />
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span
          style={{
            color: '#0B130F',
            fontSize: isLead ? 'clamp(1.5rem, 5vw, 2.4rem)' : 'clamp(1.35rem, 4vw, 1.65rem)',
            lineHeight: 1.1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: isLead ? 800 : 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: isLead ? '-0.03em' : '-0.025em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          {value}
        </span>
        {hint ? (
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: tone === 'warn' ? '#EF4444' : tone === 'aqua' ? '#0d2035' : '#6C7E75',
              opacity: tone === 'aqua' ? 0.85 : 1,
              lineHeight: 1.4,
            }}
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
