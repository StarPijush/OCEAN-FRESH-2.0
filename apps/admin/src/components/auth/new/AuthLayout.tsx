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
        /* Spark auth: light canvas + lime radial + white card — mapped aqua */
        .auth-shell {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: #F4F6F5;
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        .auth-shell::before {
          content: '';
          position: absolute;
          width: 340px;
          height: 340px;
          top: -60px;
          left: -60px;
          background: radial-gradient(circle, rgba(74,184,193,0.12) 0%, rgba(74,184,193,0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .auth-shell::after {
          content: '';
          position: absolute;
          width: 420px;
          height: 420px;
          bottom: -80px;
          right: -60px;
          background: radial-gradient(circle, rgba(74,184,193,0.10) 0%, rgba(74,184,193,0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
          background: #FFFFFF;
          border: 1px solid #E9EFEF;
          border-radius: 24px;
          padding: 40px 32px 32px;
          box-shadow: 0 20px 50px rgba(11,19,15,0.08);
          animation: authSlideUp 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: transform 300ms ease, box-shadow 300ms ease;
        }
        .auth-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 30px 60px rgba(11,19,15,0.12);
        }

        .auth-brand {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.85rem, 6vw, 2.15rem);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0d2035;
          line-height: 1;
          margin-bottom: 12px;
          text-align: center;
          white-space: nowrap;
        }

        .auth-brand span {
          color: #4ab8c1;
          font-weight: 600;
        }

        .auth-eyebrow {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #879A91;
          line-height: 1.4;
          margin-bottom: 48px;
          text-align: center;
        }
        .auth-card.has-header .auth-eyebrow {
          margin-bottom: 28px;
        }

        .auth-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
          color: #0B130F;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .auth-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.6;
          color: #6C7E75;
          margin-bottom: 28px;
          text-align: center;
        }
        .auth-card.subtitle-only .auth-subtitle {
          text-align: center;
          max-width: 30ch;
          margin-left: auto;
          margin-right: auto;
        }
        /* OTP — same light hierarchy */
        .auth-card.otp .auth-brand {
          font-size: clamp(1.85rem, 6vw, 2.15rem);
          letter-spacing: 0.12em;
          margin-bottom: 12px;
        }
        .auth-card.otp .auth-eyebrow {
          font-size: 8.5px;
          letter-spacing: 0.18em;
          color: #879A91;
          margin-bottom: 28px;
        }
        .auth-card.otp .auth-title {
          text-align: center;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 8px;
          color: #0B130F;
        }
        .auth-card.otp .auth-subtitle {
          text-align: center;
          max-width: 30ch;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 28px;
          font-size: 13px;
          line-height: 1.6;
          color: #6C7E75;
        }
        .auth-card.otp .auth-subtitle strong {
          color: #0B130F;
          font-weight: 600;
        }

        .auth-subtitle strong {
          color: #0B130F;
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
            border-radius: 14px;
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
            border-radius: 14px;
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
          color: rgba(108,126,117,0.5);
          opacity: 1;
        }
        .auth-card input::-ms-input-placeholder {
          color: rgba(108,126,117,0.5);
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
