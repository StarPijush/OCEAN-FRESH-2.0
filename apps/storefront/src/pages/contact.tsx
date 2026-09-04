import { SocialContactCard } from '../components/social/SocialContactCard.js';
import { useSettings } from '../context/settings-context.js';
import { useReveal } from '../hooks/useReveal.js';

export function ContactPage() {
  useReveal();
  const s = useSettings();

  const mapsUrl =
    s.googleMapsUrl ||
    (s.latitude != null && s.longitude != null
      ? `https://www.google.com/maps?q=${s.latitude},${s.longitude}`
      : null);
  const hasLocation = Boolean(mapsUrl);
  const addressLine1 = s.addressLines[0] ?? '';
  const addressLine2 = s.addressLines[1] ?? '';
  // If structured city/state/postal exist and not already in addressLine2, append for display
  const structuredSuffix = [s.city, s.state, s.postalCode].filter(Boolean).join(', ');
  const displayLine2 =
    structuredSuffix && addressLine2 && !addressLine2.includes(structuredSuffix.split(',')[0] ?? '')
      ? `${addressLine2} · ${structuredSuffix}`
      : structuredSuffix && !addressLine2
        ? structuredSuffix
        : addressLine2;

  // Admin-configured social destinations — only Instagram, Facebook, WhatsApp, YouTube (no X/LinkedIn)
  const whatsappHref = s.whatsapp
    ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hi! I'd like to know more about today's fresh catch 🐟")}`
    : null;
  const socialCards = [
    s.instagramUrl ? { platform: 'instagram' as const, href: s.instagramUrl } : null,
    s.facebookUrl ? { platform: 'facebook' as const, href: s.facebookUrl } : null,
    whatsappHref ? { platform: 'whatsapp' as const, href: whatsappHref } : null,
    s.youtubeUrl ? { platform: 'youtube' as const, href: s.youtubeUrl } : null,
  ].filter(Boolean) as Array<{
    platform: 'instagram' | 'facebook' | 'whatsapp' | 'youtube';
    href: string;
  }>;

  return (
    <div id="page-contact" className="page active">
      <div className="contact-hero">
        <div className="hero-noise" aria-hidden="true"></div>
        <div className="contact-hero-inner">
          <div className="section-eyebrow contact-eyebrow">Get in Touch</div>
          <h2 className="contact-title">
            Let&apos;s Talk
            <br />
            <em>Fresh Fish</em>
          </h2>
          <p className="contact-sub">We&apos;re at the docks before sunrise, every day.</p>
        </div>
      </div>

      <div className="contact-list" role="list">
        <a
          href={`tel:${s.phoneRaw}`}
          className="contact-item"
          role="listitem"
          aria-label={`Call ${s.phoneDisplay}`}
          style={{ color: 'inherit' }}
        >
          <div className="contact-item-left">
            <div className="contact-item-icon" aria-hidden="true">
              📞
            </div>
            <div className="contact-item-text">
              <div className="contact-item-title">Call Us</div>
              <div className="contact-item-value">{s.phoneDisplay}</div>
            </div>
          </div>
          <div className="contact-item-arrow" aria-hidden="true">
            ›
          </div>
        </a>

        {socialCards.map(({ platform, href }) => (
          <SocialContactCard key={platform} platform={platform} href={href} />
        ))}

        <div
          className="contact-item contact-item--static"
          role="listitem"
          style={{ cursor: 'default' }}
        >
          <div className="contact-item-left">
            <div className="contact-item-icon" aria-hidden="true">
              🕒
            </div>
            <div className="contact-item-text">
              <div className="contact-item-title">Shop Hours</div>
              {s.hours && s.hours.length > 0 ? (
                s.hours.map((h, i) => (
                  <div key={i} className="contact-item-value">
                    {h}
                  </div>
                ))
              ) : (
                <div className="contact-item-value">Hours not set</div>
              )}
            </div>
          </div>
        </div>

        <div
          className="contact-item contact-item--static"
          role="listitem"
          style={{ cursor: 'default' }}
        >
          <div className="contact-item-left">
            <div className="contact-item-icon" aria-hidden="true">
              📍
            </div>
            <div className="contact-item-text">
              <div className="contact-item-title">Address</div>
              <div className="contact-item-value">{addressLine1}</div>
              {displayLine2 ? <div className="contact-item-value">{displayLine2}</div> : null}
            </div>
          </div>
        </div>

        {hasLocation ? (
          <a
            href={mapsUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
            role="listitem"
            aria-label="Open store location in Google Maps"
          >
            <div className="contact-item-left">
              <div className="contact-item-icon" aria-hidden="true">
                🗺️
              </div>
              <div className="contact-item-text">
                <div className="contact-item-title">Find Us on Maps</div>
                <div className="contact-item-value contact-item-value--accent">
                  Get Directions →
                </div>
                {s.latitude != null && s.longitude != null ? (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text-light-secondary)',
                      marginTop: 2,
                    }}
                  >
                    {s.latitude}, {s.longitude}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="contact-item-arrow" aria-hidden="true">
              ›
            </div>
          </a>
        ) : null}
      </div>

      <section className="contact-delivery" aria-labelledby="delivery-heading">
        <div id="delivery-heading" className="contact-delivery-label">
          Delivery Areas
        </div>
        <div className="area-chips">
          {s.deliveryAreas.map((area) => (
            <span className="area-chip" key={area}>
              {area}
            </span>
          ))}
          <span className="area-chip area-chip--more">+ More</span>
        </div>
      </section>

      <div className="contact-footer-bridge" aria-hidden="true"></div>

      <div className="contact-closing">
        <div className="contact-closing-wordmark">{s.storeName}</div>
        <div className="contact-closing-sub">
          {s.tagline} &middot; Est. {s.foundedYear}
        </div>
      </div>
    </div>
  );
}
