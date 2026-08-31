import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          Ocean<span>Fresh</span>
        </div>
        <div className="auth-eyebrow">{eyebrow}</div>
        <h1 className="auth-title">{title}</h1>
        <div className="auth-subtitle">{subtitle}</div>
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
          background: #f7f5f0;
          position: relative;
        }

        .auth-card {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border: 1px solid #ece9e3;
          border: 1px solid rgba(15, 23, 42, 0.07);
          border-radius: 16px;
          padding: 36px 32px 32px;
          box-shadow:
            0 1px 2px rgba(16, 24, 40, 0.04),
            0 4px 12px rgba(16, 24, 40, 0.05),
            0 16px 32px rgba(16, 24, 40, 0.06);
          animation: authSlideUp 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .auth-brand {
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 10px;
        }

        .auth-brand span {
          color: var(--color-aqua);
          color: #4ab8c1;
          font-weight: 600;
        }

        .auth-eyebrow {
          font-family: var(--font-ui);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9590;
          color: #8a857e;
          line-height: 1.4;
          margin-bottom: 26px;
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.05;
          color: #0f172a;
          color: #1a1d23;
          margin: 0 0 8px 0;
        }

        .auth-subtitle {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.6;
          color: #78716c;
          color: #6b7280;
          margin-bottom: 28px;
        }

        .auth-subtitle strong {
          color: #1a1d23;
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
            padding: 28px 22px 24px;
            border-radius: 14px;
          }
          .auth-title {
            font-size: 26px;
          }
          .auth-eyebrow {
            margin-bottom: 22px;
            font-size: 8.5px;
          }
          .auth-subtitle {
            font-size: 12.5px;
            margin-bottom: 22px;
          }
        }

        @media (max-width: 360px) {
          .auth-shell {
            padding: 16px 12px;
          }
          .auth-card {
            padding: 24px 18px 20px;
          }
          .auth-title {
            font-size: 24px;
          }
        }

        @media (max-width: 320px) {
          .auth-card {
            border-radius: 12px;
          }
        }

        @media (min-width: 768px) {
          .auth-card {
            max-width: 396px;
          }
        }

        @media (min-width: 1024px) {
          .auth-shell {
            padding: 40px 24px;
          }
          .auth-card {
            max-width: 400px;
            padding: 40px 36px 36px;
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
          color: #a8a29e;
          opacity: 1;
        }
        .auth-card input::-ms-input-placeholder {
          color: #a8a29e;
        }

        /* Ensure page never causes horizontal overflow */
        .auth-shell,
        .auth-card,
        .auth-card * {
          min-width: 0;
          overflow-wrap: break-word;
        }
      `}</style>
    </div>
  );
}
