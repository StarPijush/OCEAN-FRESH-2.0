import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="section" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div className="section-eyebrow reveal" style={{ justifyContent: 'center', display: 'flex' }}>
        Ready to order?
      </div>
      <h2 className="section-title-lg reveal" style={{ marginBottom: '8px' }}>
        Fresh fish,<br /><em style={{ fontStyle: 'italic' }}>one tap away.</em>
      </h2>
      <div className="section-rule reveal" style={{ margin: '20px auto' }}></div>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', maxWidth: '260px', margin: '0 auto 32px', lineHeight: 1.7 }} className="reveal">
        Place your order in under a minute via WhatsApp.
      </p>
      <button
        className="btn btn-dark btn-wa-cta reveal"
        onClick={() => navigate('/order')}
        style={{ fontSize: '0.72rem', padding: '14px 36px', borderRadius: '2px', background: 'var(--deep)', color: 'var(--cream)' }}
      >
        Start Order &rarr;
      </button>
    </section>
  );
}
