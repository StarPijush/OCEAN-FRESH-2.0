import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell" style={authShellStyle}>
      <div style={authBgStyle} aria-hidden />
      <div style={authGridStyle} aria-hidden />
      <div className="auth-card" style={authCardStyle}>
        <div style={logoStyle}>
          Ocean<span style={{ color: 'var(--color-aqua)' }}>Fresh</span>
        </div>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h2 style={titleStyle}>{title}</h2>
        <div style={subtitleStyle}>{subtitle}</div>
        {children}
      </div>
    </div>
  );
}

const authShellStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--color-bg)',
};

const authBgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(ellipse at 20% 50%, rgba(74,184,193,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(74,184,193,0.04) 0%, transparent 50%)',
};

const authGridStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

const authCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  width: '100%',
  maxWidth: 400,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border2)',
  borderRadius: 'var(--radius-md)',
  padding: '40px 36px',
  animation: 'slideUp 600ms var(--ease-out) both',
};

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.5rem',
  fontWeight: 400,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-cream)',
  marginBottom: 4,
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.6rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-muted)',
  fontWeight: 500,
  marginBottom: 32,
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.7rem',
  fontWeight: 300,
  color: 'var(--color-cream)',
  margin: '0 0 6px 0',
  letterSpacing: '0.01em',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.78rem',
  color: 'var(--color-muted2)',
  marginBottom: 28,
  lineHeight: 1.6,
};
