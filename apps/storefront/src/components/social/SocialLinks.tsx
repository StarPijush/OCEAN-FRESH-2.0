import './SocialLinks.css';

import { useCallback, useState } from 'react';

import { useSettings } from '../../context/settings-context.js';

// ---------------------------------------------------------------------------
// Social configuration — replace with your real profile URLs.
// Keep this object isolated so marketing can update links without touching markup.
// Do NOT use href="#" in production; leave a key empty ("") to hide that button.
// ---------------------------------------------------------------------------
function useSocialLinks() {
  const settings = useSettings();
  const waMsg = encodeURIComponent(`Hi ${settings.storeName}! I'd like to know more \uD83D\uDC1F`);
  return {
    instagram: settings.instagramUrl ?? null,
    facebook: settings.facebookUrl ?? null,
    youtube: settings.youtubeUrl ?? null,
    whatsapp: settings.orderWhatsApp
      ? `https://wa.me/${settings.orderWhatsApp}?text=${waMsg}`
      : null,
  } as const;
}

type ActiveKey = 'instagram' | 'facebook' | 'youtube' | 'whatsapp' | null;

export function SocialLinks() {
  const links = useSocialLinks();
  const [active, setActive] = useState<ActiveKey>(null);

  const trigger = useCallback((key: ActiveKey) => {
    setActive(key);
    window.setTimeout(() => {
      setActive((prev) => (prev === key ? null : prev));
    }, 700);
  }, []);

  // Hide entire section if no links at all (should not happen — whatsapp fallback exists)
  // Active 4-platform only: Instagram, Facebook, YouTube, WhatsApp (WhatsApp via existing whatsapp_number)
  const hasAny = links.instagram || links.facebook || links.youtube || links.whatsapp;
  if (!hasAny) return null;

  return (
    <section className="social-section" aria-labelledby="social-heading">
      <div className="social-section-inner">
        <p id="social-heading" className="social-eyebrow">
          Connect with us
        </p>
        <div className="social-card" role="list" style={{ flexWrap: 'wrap' }}>
          {links.instagram ? (
            <a
              role="listitem"
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={`social-btn social-btn--instagram${active === 'instagram' ? ' is-active' : ''}`}
              onPointerDown={() => trigger('instagram')}
              onTouchStart={() => trigger('instagram')}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </a>
          ) : null}

          {links.facebook ? (
            <a
              role="listitem"
              href={links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={`social-btn social-btn--facebook${active === 'facebook' ? ' is-active' : ''}`}
              onPointerDown={() => trigger('facebook')}
              onTouchStart={() => trigger('facebook')}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
              </svg>
            </a>
          ) : null}

          {links.youtube ? (
            <a
              role="listitem"
              href={links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className={`social-btn social-btn--youtube${active === 'youtube' ? ' is-active' : ''}`}
              onPointerDown={() => trigger('youtube')}
              onTouchStart={() => trigger('youtube')}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23 12s0-3.5-.45-5.18a2.82 2.82 0 0 0-1.98-1.98C18.88 4.39 12 4.39 12 4.39s-6.88 0-8.57.45a2.82 2.82 0 0 0-1.98 1.98C1 8.5 1 12 1 12s0 3.5.45 5.18a2.82 2.82 0 0 0 1.98 1.98c1.69.45 8.57.45 8.57.45s6.88 0 8.57-.45a2.82 2.82 0 0 0 1.98-1.98C23 15.5 23 12 23 12zm-13.2 3.6V8.4L16 12l-6.2 3.6z" />
              </svg>
            </a>
          ) : null}

          {links.whatsapp ? (
            <a
              role="listitem"
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={`social-btn social-btn--whatsapp${active === 'whatsapp' ? ' is-active' : ''}`}
              onPointerDown={() => trigger('whatsapp')}
              onTouchStart={() => trigger('whatsapp')}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
