import { useSettings } from '../context/settings-context.js';
import { useReveal } from '../hooks/useReveal.js';

export function ContactPage() {
  useReveal();
  const s = useSettings();

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

        <a
          href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hi! I'd like to know more about today's fresh catch 🐟")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-item contact-item--whatsapp"
          role="listitem"
          aria-label="Chat on WhatsApp"
        >
          <div className="contact-item-left">
            <div className="contact-item-icon contact-item-icon--whatsapp" aria-hidden="true">
              💬
            </div>
            <div className="contact-item-text">
              <div className="contact-item-title">WhatsApp</div>
              <div className="contact-item-value contact-item-value--accent">Chat now</div>
            </div>
          </div>
          <div className="contact-item-arrow" aria-hidden="true">
            ›
          </div>
        </a>

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
              <div className="contact-item-value">{s.hours[0]}</div>
              <div className="contact-item-value">{s.hours[1]}</div>
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
              <div className="contact-item-value">{s.addressLines[0]}</div>
              <div className="contact-item-value">{s.addressLines[1]}</div>
            </div>
          </div>
        </div>
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
