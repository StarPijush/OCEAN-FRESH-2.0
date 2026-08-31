import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  eyebrow: string;
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  const hasHeader = Boolean(title || subtitle);
  const isSubtitleOnly = !title && Boolean(subtitle);
  const isOtp = eyebrow === 'Two-Step Verification';
  return (
    <div className="auth-shell">
      <div
        className={`auth-card ${hasHeader ? 'has-header' : 'no-header'} ${isSubtitleOnly ? 'subtitle-only' : ''} ${isOtp ? 'otp' : ''}`}
      >
        <div className="auth-brand">
          Ocean<span>Fresh</span>
        </div>
        <div className="auth-eyebrow">{eyebrow}</div>
        {title ? <h1 className="auth-title">{title}</h1> : null}
        {subtitle ? <div className="auth-subtitle">{subtitle}</div> : null}
        {children}
      </div>

      <style>{`
        .auth-shell {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: var(--color-navy-deep, #071526);
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        /* Sophisticated depth: deep-ocean at night — grid extremely subtle, atmospheric */
        .auth-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(39,195,200,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(39,195,200,0.028) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.9;
        }
        .auth-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 960px 640px at 72% -8%, rgba(39,195,200,0.055), transparent 62%),
            radial-gradient(ellipse 760px 520px at 18% 108%, rgba(216,199,166,0.035), transparent 60%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E");
          opacity: 1;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: var(--color-navy-surface, #0d2035);
          border: 1px solid rgba(39, 195, 200, 0.11);
          border-radius: 12px;
          padding: 40px 32px 32px;
          box-shadow:
            0 18px 50px rgba(7, 21, 38, 0.32),
            0 4px 16px rgba(7, 21, 38, 0.22),
            0 0 0 1px rgba(255, 255, 255, 0.02) inset,
            0 0 28px rgba(39, 195, 200, 0.06);
          animation: authSlideUp 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .auth-brand {
          font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.85rem, 6vw, 2.45rem);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-teal, #27c3c8);
          line-height: 1;
          margin-bottom: 12px;
          text-align: center;
          white-space: nowrap;
        }

        .auth-brand span {
          color: var(--color-teal, #27c3c8);
          font-weight: 600;
        }

        .auth-eyebrow {
          font-family: var(--font-ui, 'Instrument Sans', sans-serif);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-text-muted, #8291a5);
          line-height: 1.4;
          margin-bottom: 48px;
          text-align: center;
        }
        .auth-card.has-header .auth-eyebrow {
          margin-bottom: 36px;
        }

        .auth-title {
          font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
          font-size: 30px;
          font-weight: 300;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: var(--color-text-primary, #f2eee6);
          margin: 0 0 10px 0;
          text-align: left;
        }

        .auth-subtitle {
          font-family: var(--font-ui, 'Instrument Sans', sans-serif);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--color-text-secondary, #aeb9c8);
          margin-bottom: 32px;
          text-align: left;
        }
        .auth-card.subtitle-only .auth-subtitle {
          text-align: center;
          max-width: 28ch;
          margin-left: auto;
          margin-right: auto;
        }
        /* OTP premium top section — refined luxury hierarchy */
        .auth-card.otp .auth-brand {
          font-size: clamp(2.0rem, 6.2vw, 2.62rem);
          letter-spacing: 0.09em;
          margin-bottom: 10px;
        }
        .auth-card.otp .auth-eyebrow {
          font-size: 8.5px;
          letter-spacing: 0.18em;
          color: #7e90a8;
          margin-bottom: 44px;
        }
        .auth-card.otp .auth-title {
          text-align: center;
          font-size: clamp(1.45rem, 4.5vw, 1.85rem);
          font-weight: 350;
          letter-spacing: -0.018em;
          line-height: 1.15;
          margin-bottom: 14px;
          color: var(--color-text-primary, #f2eee6);
        }
        .auth-card.otp .auth-subtitle {
          text-align: center;
          max-width: 30ch;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 32px;
          font-size: 12.8px;
          line-height: 1.7;
          color: #aeb9c8;
        }
        .auth-card.otp .auth-subtitle strong {
          color: #f2eee6;
          font-weight: 600;
        }

        .auth-subtitle strong {
          color: var(--color-text-primary, #f2eee6);
          font-weight: 600;
        }

        @keyframes authSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 430px) {
          .auth-shell {
            padding: 20px 14px;
            align-items: center;
          }
          .auth-card {
            max-width: 100%;
            padding: 32px 22px 24px;
            border-radius: 10px;
          }
          .auth-brand {
            font-size: clamp(1.55rem, 7vw, 1.85rem);
          }
          .auth-card.otp .auth-brand {
            font-size: clamp(1.70rem, 7vw, 1.95rem);
            letter-spacing: 0.08em;
          }
          .auth-eyebrow {
            margin-bottom: 40px;
            font-size: 8.5px;
          }
          .auth-card.otp .auth-eyebrow {
            margin-bottom: 36px;
            font-size: 8px;
          }
          .auth-card.has-header .auth-eyebrow {
            margin-bottom: 22px;
          }
          .auth-card.otp.has-header .auth-eyebrow {
            margin-bottom: 36px;
          }
          .auth-title {
            font-size: 26px;
          }
          .auth-card.otp .auth-title {
            font-size: clamp(1.25rem, 5vw, 1.5rem);
          }
          .auth-subtitle {
            font-size: 12.5px;
            margin-bottom: 22px;
          }
          .auth-card.otp .auth-subtitle {
            font-size: 12px;
            margin-bottom: 24px;
          }
        }

        @media (max-width: 360px) {
          .auth-shell {
            padding: 16px 12px;
          }
          .auth-card {
            padding: 28px 18px 20px;
          }
          .auth-brand {
            font-size: 1.55rem;
            letter-spacing: 0.10em;
          }
          .auth-title {
            font-size: 24px;
          }
        }

        @media (max-width: 320px) {
          .auth-card {
            border-radius: 10px;
          }
        }

        @media (min-width: 768px) {
          .auth-card {
            max-width: 420px;
          }
        }

        @media (min-width: 1024px) {
          .auth-shell {
            padding: 40px 24px;
          }
          .auth-card {
            max-width: 420px;
            padding: 44px 36px 36px;
          }
          .auth-brand {
            font-size: 2.35rem;
          }
          .auth-title {
            font-size: 32px;
          }
        }

        @media (min-width: 1440px) {
          .auth-shell {
            padding: 48px 24px;
          }
        }

        .auth-card input::placeholder {
          color: var(--color-text-muted, #8291a5);
          opacity: 1;
        }
        .auth-card input::-ms-input-placeholder {
          color: var(--color-text-muted, #8291a5);
        }

        /* Ensure page never causes horizontal overflow */
        .auth-shell,
        .auth-card,
        .auth-card * {
          min-width: 0;
          overflow-wrap: break-word;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-card {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
