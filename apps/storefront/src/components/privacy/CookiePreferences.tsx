import './CookieConsent.css';

import { useEffect, useRef, useState } from 'react';

import { useCookieConsent } from '../../context/CookieConsentContext.js';
import type { CookieConsent } from './cookie-consent.js';

export function CookiePreferences() {
  const { consent, showPreferences, closePreferences, savePreferences } = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Sync local state when consent or visibility changes
  useEffect(() => {
    if (consent) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
      setPreferences(consent.preferences);
    } else {
      setAnalytics(false);
      setMarketing(false);
      setPreferences(false);
    }
  }, [consent, showPreferences]);

  // Focus trap + ESC handling
  useEffect(() => {
    if (!showPreferences) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    // Focus first toggle
    window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>('[role="switch"]');
      first?.focus();
    }, 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closePreferences();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, [role="switch"], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showPreferences, closePreferences]);

  function handleSave() {
    const next: Pick<CookieConsent, 'analytics' | 'marketing' | 'preferences'> = {
      analytics,
      marketing,
      preferences,
    };
    savePreferences(next);
  }

  function onOverlayClick() {
    closePreferences();
  }

  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <>
      <div
        className={`cookie-prefs-overlay${showPreferences ? ' show' : ''}`}
        onClick={onOverlayClick}
        aria-hidden={showPreferences ? undefined : true}
      />
      <div
        ref={dialogRef}
        className={`cookie-prefs${showPreferences ? ' show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        aria-hidden={showPreferences ? undefined : true}
        inert={showPreferences ? undefined : true}
        onClick={stopPropagation}
      >
        <div className="cookie-prefs__head">
          <h2 id="cookie-prefs-title" className="cookie-prefs__title">
            Cookie Preferences
          </h2>
          <button
            type="button"
            className="cookie-prefs__close"
            onClick={closePreferences}
            aria-label="Close preferences"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="cookie-prefs__body">
          {/* Necessary — always on */}
          <div className="cookie-prefs__row">
            <div className="cookie-prefs__label">
              <p className="cookie-prefs__name">
                Necessary <span className="cookie-prefs__badge">Always active</span>
              </p>
              <p className="cookie-prefs__desc">
                Required for the website to function, including shopping cart, security and
                checkout.
              </p>
              <p className="cookie-prefs__hint">
                Covers: fresh-catch-cart, oceanfresh.auth.session, Supabase auth token.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={true}
              aria-label="Necessary cookies always active"
              className="cookie-prefs__toggle"
              disabled
              title="Necessary cookies cannot be disabled"
            />
          </div>

          {/* Analytics — dormant until GA4/PostHog added */}
          <div className="cookie-prefs__row">
            <div className="cookie-prefs__label">
              <p className="cookie-prefs__name">Analytics</p>
              <p className="cookie-prefs__desc">
                Helps us understand how visitors use OceanFresh so we can improve the website.
              </p>
              <p className="cookie-prefs__hint">
                No analytics cookies are currently used. Enabling will allow future analytics only
                after you consent.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              aria-label="Toggle analytics cookies"
              className="cookie-prefs__toggle"
              onClick={() => setAnalytics((v) => !v)}
            />
          </div>

          {/* Preferences — dormant */}
          <div className="cookie-prefs__row">
            <div className="cookie-prefs__label">
              <p className="cookie-prefs__name">Preferences</p>
              <p className="cookie-prefs__desc">
                Remembers your language, region and display choices.
              </p>
              <p className="cookie-prefs__hint">
                Optional. No preference cookies are currently used.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences}
              aria-label="Toggle preference cookies"
              className="cookie-prefs__toggle"
              onClick={() => setPreferences((v) => !v)}
            />
          </div>

          {/* Marketing — dormant until pixel added */}
          <div className="cookie-prefs__row">
            <div className="cookie-prefs__label">
              <p className="cookie-prefs__name">Marketing</p>
              <p className="cookie-prefs__desc">
                Used to measure advertising and provide more relevant marketing.
              </p>
              <p className="cookie-prefs__hint">No marketing cookies are currently used.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={marketing}
              aria-label="Toggle marketing cookies"
              className="cookie-prefs__toggle"
              onClick={() => setMarketing((v) => !v)}
            />
          </div>
        </div>

        <div className="cookie-prefs__foot">
          <button
            type="button"
            className="cookie-btn cookie-btn--secondary"
            onClick={closePreferences}
          >
            Cancel
          </button>
          <button type="button" className="cookie-btn cookie-btn--primary" onClick={handleSave}>
            Save preferences
          </button>
        </div>
      </div>
    </>
  );
}
