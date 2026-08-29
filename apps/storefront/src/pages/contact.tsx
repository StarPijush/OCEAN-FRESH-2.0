import { useSettings } from '../context/settings-context.js';
import { useReveal } from '../hooks/useReveal.js';

export function ContactPage() {
  useReveal();
  const s = useSettings();

  return (
    <div id="page-contact" className="page active">
      <div className="contact-hero">
        <div className="hero-noise"></div>
        <div className="section-eyebrow" style={{ marginBottom: '20px' }}>
          Get in Touch
        </div>
        <h2 className="contact-title">
          Let&apos;s Talk
          <br />
          <em>Fresh Fish</em>
        </h2>
        <p className="contact-sub" style={{ marginTop: '12px' }}>
          We&apos;re at the docks before sunrise, every day.
        </p>
      </div>

      <div className="contact-list">
        <a href={`tel:${s.phoneRaw}`} className="contact-item" style={{ color: 'inherit' }}>
          <div className="contact-item-left">
            <div className="contact-item-icon">{'\u{1F4F1}'}</div>
            <div>
              <div className="contact-item-title">Call Us</div>
              <div className="contact-item-value">{s.phoneDisplay}</div>
            </div>
          </div>
          <div className="contact-item-arrow">{'\u203A'}</div>
        </a>

        <div
          className="contact-item"
          onClick={() =>
            window.open(
              `https://wa.me/${s.whatsapp}?text=` +
                encodeURIComponent("Hi! I'd like to know more about today's fresh catch \u{1F41F}"),
              '_blank',
            )
          }
        >
          <div className="contact-item-left">
            <div className="contact-item-icon" style={{ background: '#dcfce7' }}>
              {'\u{1F4AC}'}
            </div>
            <div>
              <div className="contact-item-title">WhatsApp</div>
              <div className="contact-item-value" style={{ color: '#25D366' }}>
                Chat now
              </div>
            </div>
          </div>
          <div className="contact-item-arrow">{'\u203A'}</div>
        </div>

        <div className="contact-item" style={{ cursor: 'default' }}>
          <div className="contact-item-left">
            <div className="contact-item-icon">{'\u{1F550}'}</div>
            <div>
              <div className="contact-item-title">Shop Hours</div>
              <div className="contact-item-value">{s.hours[0]}</div>
              <div className="contact-item-value">{s.hours[1]}</div>
            </div>
          </div>
        </div>

        <div className="contact-item" style={{ cursor: 'default' }}>
          <div className="contact-item-left">
            <div className="contact-item-icon">{'\u{1F4CD}'}</div>
            <div>
              <div className="contact-item-title">Address</div>
              <div className="contact-item-value">{s.addressLines[0]}</div>
              <div className="contact-item-value">{s.addressLines[1]}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 32px', background: 'var(--color-ivory)' }}>
        <div
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--muted)',
            padding: '20px 0 16px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            marginBottom: '16px',
          }}
        >
          Delivery Areas
        </div>
        <div className="area-chips">
          {s.deliveryAreas.map((area) => (
            <span className="area-chip" key={area}>
              {area}
            </span>
          ))}
          <span className="area-chip" style={{ background: 'var(--sand)', color: 'var(--muted)' }}>
            + More
          </span>
        </div>
      </div>

      <div style={{ background: 'var(--deep)', padding: '32px 24px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 300,
            color: 'var(--cream)',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}
        >
          {s.storeName}
        </div>
        <div
          style={{ fontSize: '0.65rem', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.1em' }}
        >
          {s.tagline} &middot; Est. {s.foundedYear}
        </div>
      </div>
    </div>
  );
}
