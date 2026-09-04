import { Link } from 'react-router-dom';

import { useSettings } from '../../context/settings-context.js';
import { CookieSettingsButton } from '../privacy/CookieSettingsButton.js';
import { SocialLinks } from '../social/SocialLinks.js';

export function Footer() {
  const s = useSettings();
  return (
    <footer style={{ background: 'var(--ink)', padding: '32px 24px' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 300,
          color: 'var(--cream)',
          letterSpacing: '0.08em',
          marginBottom: '12px',
        }}
      >
        {s.storeName}
      </div>
      <div
        style={{
          fontSize: '0.68rem',
          color: 'rgba(245,240,232,0.3)',
          letterSpacing: '0.1em',
          lineHeight: 2,
        }}
      >
        {s.addressLines[0]}
        <br />
        {s.addressLines[1]}
        <br />
        {s.email}
      </div>

      <SocialLinks />

      <nav
        aria-label="Legal"
        style={{
          marginTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px 20px',
        }}
      >
        <Link
          to="/privacy"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.66rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.66rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Terms &amp; Conditions
        </Link>
        <Link
          to="/cookie-policy"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.66rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Cookie Policy
        </Link>
        <CookieSettingsButton
          label="Cookie Settings"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.66rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        />
      </nav>

      <div
        style={{
          marginTop: '18px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          fontSize: '0.6rem',
          color: 'rgba(245,240,232,0.2)',
          letterSpacing: '0.12em',
        }}
      >
        &copy; {s.foundedYear} {s.storeName} &middot; All rights reserved
      </div>
    </footer>
  );
}
