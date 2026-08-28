const promises = [
  {
    icon: '\u2705',
    name: 'Morning catch, same day',
    desc: 'Picked daily and delivered within hours for peak freshness.',
  },
  {
    icon: '\u{1F3C5}',
    name: 'Quality assurance',
    desc: 'Hand-inspected products with no preservatives, no stale stock.',
  },
  {
    icon: '\u{1F4E6}',
    name: 'Fast delivery',
    desc: '2-3 hour delivery across our service areas.',
  },
];

export function AboutSection() {
  return (
    <section className="section" style={{ background: 'var(--color-ivory)', padding: '60px 24px' }}>
      <div className="section-eyebrow reveal">About OceanFresh</div>
      <h2 className="section-title-lg reveal">Trusted by families in Jhargram</h2>
      <p
        style={{
          maxWidth: '680px',
          margin: '12px auto 24px',
          color: 'var(--color-text-light-secondary)',
          lineHeight: 1.7,
        }}
        className="reveal"
      >
        OceanFresh has been serving premium seafood since 2018 with a focus on freshness, hygiene
        and fast delivery. We source directly from local fish markets and process orders in chilled
        conditions so you receive quality seafood every time.
      </p>
      <div className="why-grid why-grid-about" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {promises.map((p, i) => (
          <div
            className="why-card reveal"
            key={i}
            style={i > 0 ? { transitionDelay: `${i * 0.1}s` } : undefined}
          >
            <div className="why-icon">{p.icon}</div>
            <div className="why-name">{p.name}</div>
            <div className="why-desc">{p.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
