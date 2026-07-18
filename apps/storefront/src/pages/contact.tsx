import { useReveal } from '../hooks/useReveal.js';

export function ContactPage() {
  useReveal();

  return (
    <div id="page-contact" className="page active">
      <div className="contact-hero">
        <div className="hero-noise"></div>
        <div className="section-eyebrow" style={{ marginBottom: '20px' }}>Get in Touch</div>
        <h2 className="contact-title">Let's Talk<br /><em>Fresh Fish</em></h2>
        <p className="contact-sub" style={{ marginTop: '12px' }}>We're at the docks before sunrise, every day.</p>
      </div>

      <div className="contact-list">
        <a href="tel:+919876543210" className="contact-item" style={{ color: 'inherit' }}>
          <div className="contact-item-left">
            <div className="contact-item-icon">{'\u{1F4F1}'}</div>
            <div>
              <div className="contact-item-title">Call Us</div>
              <div className="contact-item-value">+91 98765 43210</div>
            </div>
          </div>
          <div className="contact-item-arrow">{'\u203A'}</div>
        </a>

        <div className="contact-item" onClick={() => window.open('https://wa.me/919876543210?text=' + encodeURIComponent("Hi! I'd like to know more about today's fresh catch \u{1F41F}"), '_blank')}>
          <div className="contact-item-left">
            <div className="contact-item-icon" style={{ background: '#dcfce7' }}>{'\u{1F4AC}'}</div>
            <div>
              <div className="contact-item-title">WhatsApp</div>
              <div className="contact-item-value" style={{ color: '#25D366' }}>Chat now</div>
            </div>
          </div>
          <div className="contact-item-arrow">{'\u203A'}</div>
        </div>

        <div className="contact-item" style={{ cursor: 'default' }}>
          <div className="contact-item-left">
            <div className="contact-item-icon">{'\u{1F550}'}</div>
            <div>
              <div className="contact-item-title">Shop Hours</div>
              <div className="contact-item-value">Mon\u2013Sat &middot; 6AM \u2013 9PM</div>
              <div className="contact-item-value">Sunday &middot; 6AM \u2013 2PM</div>
            </div>
          </div>
        </div>

        <div className="contact-item" style={{ cursor: 'default' }}>
          <div className="contact-item-left">
            <div className="contact-item-icon">{'\u{1F4CD}'}</div>
            <div>
              <div className="contact-item-title">Address</div>
              <div className="contact-item-value">Shop No. 12, Fish Market</div>
              <div className="contact-item-value">Jhargram, West Bengal 721507</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 32px' }}>
        <div style={{
          fontSize: '0.6rem',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--muted)',
          padding: '20px 0 16px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          marginBottom: '16px',
        }}>
          Delivery Areas
        </div>
        <div className="area-chips">
          <span className="area-chip">Jamboni</span>
          <span className="area-chip">Binpur</span>
          <span className="area-chip">Gopiballavpur</span>
          <span className="area-chip">Belpahari</span>
          <span className="area-chip">Nayagram</span>
          <span className="area-chip">Sankrail</span>
          <span className="area-chip">Rohini</span>
          <span className="area-chip">Silda</span>
          <span className="area-chip">Gidhni</span>
          <span className="area-chip">Lodhasuli</span>
          <span className="area-chip" style={{ background: 'var(--sand)', color: 'var(--muted)' }}>+ More</span>
        </div>
      </div>

      <div style={{ background: 'var(--deep)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 300,
          color: 'var(--cream)',
          letterSpacing: '0.1em',
          marginBottom: '8px',
        }}>
          OceanFresh
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.1em' }}>
          Fresh Seafood &middot; Jhargram, West Bengal &middot; Est. 2018
        </div>
      </div>
    </div>
  );
}
