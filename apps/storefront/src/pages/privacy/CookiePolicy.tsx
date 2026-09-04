import { formatLegalDate, LEGAL_LAST_UPDATED_ISO } from '@oceanfresh/shared';
import { Link } from 'react-router-dom';

import { Footer } from '../../components/layout/Footer.js';
import { useCookieConsent } from '../../context/CookieConsentContext.js';
import { useSettings } from '../../context/settings-context.js';

export function CookiePolicyPage() {
  const settings = useSettings();
  const { openPreferences } = useCookieConsent();

  return (
    <div id="page-cookie-policy" className="page active" style={{ paddingTop: 72 }}>
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'var(--space-10) var(--gutter-mobile) var(--space-12)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-eyebrow)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--muted)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Legal · Privacy
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 2.6rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 'var(--space-2)',
          }}
        >
          Cookie Policy
        </h1>
        <div style={{ width: 32, height: 1, background: 'var(--aqua)', margin: '16px 0 20px' }} />
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--muted)',
            lineHeight: 1.7,
            marginBottom: 'var(--space-8)',
          }}
        >
          Last updated: {formatLegalDate(LEGAL_LAST_UPDATED_ISO)} · This page explains what cookies
          and similar storage OceanFresh uses, why we use them, and how you can control them. This
          is engineering implementation — not a substitute for legal advice. Consent is free,
          specific, informed, unconditional and unambiguous with clear affirmative action (DPDP Act
          framework); non-essential cookies are not set before consent (EU-style requirements).
        </p>

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 'var(--space-3)',
            }}
          >
            What are cookies?
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            Cookies are small text files stored on your device. OceanFresh primarily uses{' '}
            <code
              style={{
                background: 'var(--sand)',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: '0.78rem',
              }}
            >
              localStorage
            </code>{' '}
            — a browser storage similar to cookies — for strictly necessary functions. No
            third-party tracking cookies are currently set before you give consent.
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Strictly necessary storage (always active)
          </h2>
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                fresh-catch-cart
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>Type:</span> localStorage (Zustand persist) ·{' '}
                <span style={{ fontWeight: 600 }}>Purpose:</span> Remembers items you add to the
                cart so the cart survives reloads until checkout ·{' '}
                <span style={{ fontWeight: 600 }}>Data:</span> product IDs and quantities (JSON) ·{' '}
                <span style={{ fontWeight: 600 }}>Duration:</span> persistent until you clear site
                data
              </div>
            </div>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                oceanfresh.auth.session
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>Type:</span> localStorage (Auth session mirror) ·{' '}
                <span style={{ fontWeight: 600 }}>Purpose:</span> Keeps you signed in, manages
                idle/absolute session timers and refresh ·{' '}
                <span style={{ fontWeight: 600 }}>Duration:</span> until logout or expiry
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                sb-*-auth-token
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>Type:</span> localStorage (Supabase Auth) ·{' '}
                <span style={{ fontWeight: 600 }}>Purpose:</span> Stores Supabase JWT (access &
                refresh tokens) for authentication and auto-refresh ·{' '}
                <span style={{ fontWeight: 600 }}>Note:</span> Admin app uses memory-only (no
                persistence).
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
            These are strictly necessary and do not require prior consent under ePrivacy / DPDP.
            They are disclosed here for transparency (GDPR Art.13).
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Optional cookies (consent-gated, currently OFF)
          </h2>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <li
              style={{
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 4,
                padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                Analytics
              </span>{' '}
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                — OFF
              </span>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--muted)',
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Helps us understand how visitors use OceanFresh. No analytics cookies are currently
                used. If enabled in the future (e.g., GA4), this gate will prevent loading before
                consent. Storage key:{' '}
                <code style={{ background: 'var(--sand)', padding: '1px 6px', borderRadius: 4 }}>
                  oceanfresh-cookie-consent.analytics
                </code>
              </div>
            </li>
            <li
              style={{
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 4,
                padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                Preferences
              </span>{' '}
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                — OFF
              </span>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--muted)',
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Remembers language/region/display choices. Not currently used.
              </div>
            </li>
            <li
              style={{
                background: 'var(--white)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 4,
                padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                Marketing
              </span>{' '}
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                — OFF
              </span>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--muted)',
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Measures advertising and personalization. No marketing pixels are currently loaded.
              </div>
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 'var(--space-3)',
            }}
          >
            How to change your choice
          </h2>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--muted)',
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            You can withdraw or change consent at any time. Open Cookie Settings to enable/disable
            optional categories and save. Necessary remains always active.
          </p>
          <button
            type="button"
            onClick={openPreferences}
            className="btn btn-outline-dark btn-sm"
            style={{
              minHeight: 44,
              padding: '10px 18px',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Cookie Settings
          </button>
          <div style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.74rem',
                color: 'var(--ocean)',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              Back to Home
            </Link>
            <Link
              to="/contact"
              style={{
                fontSize: '0.74rem',
                color: 'var(--ocean)',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              Contact
            </Link>
          </div>
        </section>

        <section
          style={{
            marginBottom: 'var(--space-6)',
            padding: '14px 16px',
            background: 'var(--sand)',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}
          >
            Need help?
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            {settings.storeName} · {settings.addressLines[0]} · {settings.addressLines[1]} ·{' '}
            <a
              href={`mailto:${settings.email}`}
              style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'underline' }}
            >
              {settings.email}
            </a>{' '}
            · {settings.phoneDisplay} · WhatsApp:{' '}
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ocean)', fontWeight: 600, textDecoration: 'underline' }}
            >
              {settings.phoneDisplay}
            </a>
          </div>
          <div
            style={{
              fontSize: '0.66rem',
              color: 'var(--muted)',
              marginTop: 8,
              fontStyle: 'italic',
            }}
          >
            Engineering implementation — not a substitute for legal advice.
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
