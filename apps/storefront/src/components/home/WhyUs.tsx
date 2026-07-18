const reasons = [
  {
    icon: '\u{1F41F}',
    name: 'Daily Fresh Catch',
    desc: 'Sourced every morning directly from local Jhargram markets before 5AM.',
  },
  {
    icon: '\u{1F9FC}',
    name: 'Hygienic Processing',
    desc: 'FSSAI certified facility. Cold chain maintained end to end.',
  },
  {
    icon: '\u{1F69A}',
    name: '2\u20133 Hour Delivery',
    desc: 'From our dock to your door. Live tracking via WhatsApp.',
  },
  {
    icon: '\u2696\uFE0F',
    name: 'Honest Weights',
    desc: 'Calibrated digital scales. You pay only for what you receive.',
  },
];

export function WhyUs() {
  return (
    <section className="section section-sand">
      <div className="section-eyebrow reveal">Our Promise</div>
      <h2 className="section-title-lg reveal">Why<br />OceanFresh</h2>
      <div className="section-rule reveal"></div>
      <div className="why-grid" style={{ marginTop: '24px' }}>
        {reasons.map((r, i) => (
          <div
            className="why-card reveal"
            key={i}
            style={i > 0 ? { transitionDelay: `${0.05 + i * 0.05}s` } : undefined}
          >
            <div className="why-icon">{r.icon}</div>
            <div className="why-name">{r.name}</div>
            <div className="why-desc">{r.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
