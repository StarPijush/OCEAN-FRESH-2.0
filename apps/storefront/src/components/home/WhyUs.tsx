import './WhyUs.css';

const reasons = [
  {
    icon: '🐟',
    name: 'Daily Fresh Catch',
    desc: 'Sourced every morning directly from local Jhargram markets before 5AM.',
  },
  {
    icon: '🧼',
    name: 'Hygienic Processing',
    desc: 'FSSAI certified facility. Cold chain maintained end to end.',
  },
  {
    icon: '🚚',
    name: '2\u20133 Hour Delivery',
    desc: 'From our dock to your door. Live tracking via WhatsApp.',
  },
  {
    icon: '⚖️',
    name: 'Honest Weights',
    desc: 'Calibrated digital scales. You pay only for what you receive.',
  },
];

export function WhyUs() {
  return (
    <section className="section section-sand whyus-root">
      <div className="section-eyebrow reveal">Our Promise</div>
      <h2 className="section-title-lg reveal">
        Why <em>OceanFresh?</em>
      </h2>
      <div className="section-rule reveal"></div>
      <div className="why-grid" style={{ marginTop: '24px' }}>
        {reasons.map((r, i) => (
          <div
            className="why-card reveal"
            key={i}
            style={i > 0 ? { transitionDelay: `${0.05 + i * 0.05}s` } : undefined}
          >
            <div className="why-icon" aria-hidden="true">
              {r.icon}
            </div>
            <div className="why-name">{r.name}</div>
            <div className="why-desc">{r.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
