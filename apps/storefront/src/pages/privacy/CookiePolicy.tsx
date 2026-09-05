import { formatLegalDate, LEGAL_LAST_UPDATED_ISO } from '@oceanfresh/shared';
import { Link } from 'react-router-dom';

import { Footer } from '../../components/layout/Footer.js';
import { useCookieConsent } from '../../context/CookieConsentContext.js';
import { useSettings } from '../../context/settings-context.js';

export function CookiePolicyPage() {
  const settings = useSettings();
  const { openPreferences } = useCookieConsent();

  return (
    <div id="page-cookie-policy" className="page active">
      <div className="legal-shell">
        <p className="legal-eyebrow">Legal · Privacy</p>
        <h1 className="legal-title">Cookie Policy</h1>
        <div className="legal-rule" aria-hidden="true" />
        <p className="legal-updated">
          <strong>Last updated:</strong> {formatLegalDate(LEGAL_LAST_UPDATED_ISO)} · This page
          explains what cookies and similar storage OceanFresh uses, why we use them, and how you
          can control them. This is engineering implementation — not a substitute for legal advice.
          Consent is free, specific, informed, unconditional and unambiguous with clear affirmative
          action (DPDP Act framework); non-essential cookies are not set before consent.
        </p>

        <section className="legal-section">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device. OceanFresh primarily uses{' '}
            <code>localStorage</code> — a browser storage similar to cookies — for strictly
            necessary functions. No third-party tracking cookies are currently set before you give
            consent.
          </p>
        </section>

        <section className="legal-section">
          <h2>Strictly necessary storage (always active)</h2>
          <div className="legal-card">
            <div className="legal-card__title">fresh-catch-cart</div>
            <div className="legal-card__meta">
              <strong>Type:</strong> localStorage (Zustand persist) · <strong>Purpose:</strong>{' '}
              Remembers items you add to the cart so the cart survives reloads until checkout ·{' '}
              <strong>Data:</strong> product IDs and quantities (JSON) · <strong>Duration:</strong>{' '}
              persistent until you clear site data
            </div>
          </div>
          <div className="legal-card">
            <div className="legal-card__title">oceanfresh.auth.session</div>
            <div className="legal-card__meta">
              <strong>Type:</strong> localStorage (Auth session mirror) · <strong>Purpose:</strong>{' '}
              Keeps you signed in, manages idle/absolute session timers and refresh ·{' '}
              <strong>Duration:</strong> until logout or expiry
            </div>
          </div>
          <div className="legal-card">
            <div className="legal-card__title">sb-*-auth-token</div>
            <div className="legal-card__meta">
              <strong>Type:</strong> localStorage (Supabase Auth) · <strong>Purpose:</strong> Stores
              Supabase JWT (access & refresh tokens) for authentication and auto-refresh ·{' '}
              <strong>Note:</strong> Admin app uses memory-only (no persistence).
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
            These are strictly necessary and do not require prior consent under ePrivacy / DPDP.
            They are disclosed here for transparency (GDPR Art.13).
          </p>
        </section>

        <section className="legal-section">
          <h2>Optional cookies (consent-gated, currently OFF)</h2>
          <div className="legal-card">
            <div className="legal-card__title">
              Analytics{' '}
              <span
                className="legal-card__meta"
                style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}
              >
                — OFF
              </span>
            </div>
            <div className="legal-card__meta">
              Helps us understand how visitors use OceanFresh. No analytics cookies are currently
              used. If enabled in the future (e.g., GA4), this gate will prevent loading before
              consent. Storage key: <code>oceanfresh-cookie-consent.analytics</code>
            </div>
          </div>
          <div className="legal-card">
            <div className="legal-card__title">
              Preferences{' '}
              <span
                className="legal-card__meta"
                style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}
              >
                — OFF
              </span>
            </div>
            <div className="legal-card__meta">
              Remembers language/region/display choices. Not currently used.
            </div>
          </div>
          <div className="legal-card">
            <div className="legal-card__title">
              Marketing{' '}
              <span
                className="legal-card__meta"
                style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}
              >
                — OFF
              </span>
            </div>
            <div className="legal-card__meta">
              Measures advertising and personalization. No marketing pixels are currently loaded.
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>How to change your choice</h2>
          <p>
            You can withdraw or change consent at any time. Open Cookie Settings to enable/disable
            optional categories and save. Necessary remains always active.
          </p>
          <div className="legal-actions">
            <button type="button" onClick={openPreferences} className="btn btn-outline-dark btn-sm">
              Cookie Settings
            </button>
            <Link to="/" className="btn btn-outline-dark btn-sm">
              Back to Home
            </Link>
            <Link to="/contact" className="btn btn-outline-dark btn-sm">
              Contact
            </Link>
          </div>
        </section>

        <section className="legal-section">
          <div className="legal-card" style={{ background: 'var(--color-ivory)' }}>
            <div className="legal-card__title">Need help?</div>
            <div className="legal-card__meta">
              {settings.storeName} · {settings.addressLines[0]} · {settings.addressLines[1]} ·{' '}
              <a href={`mailto:${settings.email}`}>{settings.email}</a> · {settings.phoneDisplay} ·
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {settings.phoneDisplay}
              </a>
            </div>
            <div
              style={{
                fontSize: '0.66rem',
                color: 'var(--color-text-muted)',
                marginTop: 8,
                fontStyle: 'italic',
              }}
            >
              Engineering implementation — not a substitute for legal advice.
            </div>
          </div>
        </section>

        <div className="legal-footer">
          Related: <Link to="/privacy">Privacy Policy</Link> ·{' '}
          <Link to="/terms">Terms & Conditions</Link> · <Link to="/contact">Contact</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
